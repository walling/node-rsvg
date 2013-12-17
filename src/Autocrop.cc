
#include "Rsvg.h"
#include "RsvgCairo.h"
#include <node.h>
#include <cmath>

using namespace v8;

struct autocrop_region_t {
	double top;
	double bottom;
	double left;
	double right;
};

static inline uint32_t pixel(uint8_t* data, int stride, int x, int y) {
	return *reinterpret_cast<uint32_t*>(data + stride * y + x * 4);
}

static inline double round3(double number) {
	return round(number * 1000) * 0.001;
}

const uint32_t INVALID_COLOR = 0x00DEAD00;
static uint32_t areaColor(uint8_t* data, int stride, int x0, int x1, int y0, int y1) {
	uint32_t color = pixel(data, stride, x0, y0);
	for (int x = x0; x <= x1; x++) {
		for (int y = y0; y <= y1; y++) {
			uint32_t current = pixel(data, stride, x, y);
			if (current != color) {
				return INVALID_COLOR;
			}
		}
	}
	return color;
}

static uint32_t findEdge(uint8_t* data, int stride, int width, int height, int xd, int yd) {
	int x0 = 0;
	int x1 = width - 1;
	int y0 = 0;
	int y1 = height - 1;

	if (xd > 0) {
		x1 = x0;
	} else if (xd < 0) {
		x0 = x1;
	} else if (yd > 0) {
		y1 = y0;
	} else if (yd < 0) {
		y0 = y1;
	} else {
		return 0;
	}

	x0 -= xd;
	x1 -= xd;
	y0 -= yd;
	y1 -= yd;
	uint32_t edge = INVALID_COLOR;
	while (true) {
		x0 += xd;
		x1 += xd;
		y0 += yd;
		y1 += yd;
		if (x0 < 0 || x1 < 0 || y0 < 0 || y1 < 0 ||
				x0 >= width || x1 >= width || y0 >= height || y1 >= height) {
			x0 -= xd;
			x1 -= xd;
			y0 -= yd;
			y1 -= yd;
			break;
		}
		uint32_t color = areaColor(data, stride, x0, x1, y0, y1);
		if (edge == INVALID_COLOR) {
			edge = color;
		}
		if (color == INVALID_COLOR || color != edge) break;
	}

	return (xd != 0) ? x0 : y0;
}

static bool AutocropRecursive(RsvgHandle* handle, autocrop_region_t* region, int direction) {
	const int width = 100;
	const int height = 100;

	if (region->bottom - region->top < 0.0001 ||
			region->right - region->left < 0.0001) {
		return true;
	}

	cairo_surface_t* surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
	cairo_t* cr = cairo_create(surface);

	cairo_scale(cr, width / (region->right - region->left), height / (region->bottom - region->top));
	cairo_translate(cr, -region->left, -region->top);

	gboolean success = rsvg_handle_render_cairo(handle, cr);
	cairo_surface_flush(surface);

	cairo_status_t status = cairo_status(cr);
	if (status || !success) {
		cairo_destroy(cr);
		cairo_surface_destroy(surface);

		ThrowException(Exception::Error(String::New(
			status ? cairo_status_to_string(status) : "Failed to render image."
		)));
		return false;
	}

	uint8_t* data = cairo_image_surface_get_data(surface);
	int stride = cairo_image_surface_get_stride(surface);

	if (areaColor(data, stride, 0, width - 1, 0, height - 1) != INVALID_COLOR) {
		cairo_destroy(cr);
		cairo_surface_destroy(surface);
		return true;
	}

	autocrop_region_t sub;

	if (direction == 1) {
		int top = findEdge(data, stride, width, height, 0, 1);
		sub.top = top;
		sub.bottom = top + 1;
		sub.left = 0;
		sub.right = width;
		cairo_device_to_user(cr, &sub.left, &sub.top);
		cairo_device_to_user(cr, &sub.right, &sub.bottom);
		success = AutocropRecursive(handle, &sub, direction);
		region->top = sub.top;
	} else if (direction == 2) {
		int bottom = findEdge(data, stride, width, height, 0, -1) + 1;
		sub.top = bottom - 1;
		sub.bottom = bottom;
		sub.left = 0;
		sub.right = width;
		cairo_device_to_user(cr, &sub.left, &sub.top);
		cairo_device_to_user(cr, &sub.right, &sub.bottom);
		success = AutocropRecursive(handle, &sub, direction);
		region->bottom = sub.bottom;
	} else if (direction == 3) {
		int left = findEdge(data, stride, width, height, 1, 0);
		sub.top = 0;
		sub.bottom = height;
		sub.left = left;
		sub.right = left + 1;
		cairo_device_to_user(cr, &sub.left, &sub.top);
		cairo_device_to_user(cr, &sub.right, &sub.bottom);
		success = AutocropRecursive(handle, &sub, direction);
		region->left = sub.left;
	} else if (direction == 4) {
		int right = findEdge(data, stride, width, height, -1, 0) + 1;
		sub.top = 0;
		sub.bottom = height;
		sub.left = right - 1;
		sub.right = right;
		cairo_device_to_user(cr, &sub.left, &sub.top);
		cairo_device_to_user(cr, &sub.right, &sub.bottom);
		success = AutocropRecursive(handle, &sub, direction);
		region->right = sub.right;
	} else {
		success = false;
	}

	cairo_destroy(cr);
	cairo_surface_destroy(surface);
	return success;
}

Handle<Value> Rsvg::Autocrop(const Arguments& args) {
	HandleScope scope;
	Rsvg* obj = node::ObjectWrap::Unwrap<Rsvg>(args.This());

	RsvgDimensionData dimensions = { 0, 0, 0, 0 };
	rsvg_handle_get_dimensions(obj->_handle, &dimensions);
	autocrop_region_t area = { 0, dimensions.height, 0, dimensions.width };

	if (AutocropRecursive(obj->_handle, &area, 1) &&
			AutocropRecursive(obj->_handle, &area, 2) &&
			AutocropRecursive(obj->_handle, &area, 3) &&
			AutocropRecursive(obj->_handle, &area, 4)) {
		Handle<ObjectTemplate> dimensions = ObjectTemplate::New();
		dimensions->Set("x", Number::New(round3(area.left)));
		dimensions->Set("y", Number::New(round3(area.top)));
		dimensions->Set("width", Number::New(round3(area.right - area.left)));
		dimensions->Set("height", Number::New(round3(area.bottom - area.top)));
		return scope.Close(dimensions->NewInstance());
	} else {
		return scope.Close(Undefined());
	}
}
