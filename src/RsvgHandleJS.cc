
#include "RsvgHandleJS.h"
#include <node_buffer.h>
#include <cairo-pdf.h>
#include <cmath>

using namespace v8;

typedef enum {
	RENDER_FORMAT_INVALID = -1,
	RENDER_FORMAT_RAW = 0,
	RENDER_FORMAT_PNG = 1,
	RENDER_FORMAT_JPEG = 2,
	RENDER_FORMAT_PDF = 3,
	RENDER_FORMAT_SVG = 4,
	RENDER_FORMAT_VIPS = 5
} render_format_t;

static render_format_t RenderFormatFromString(const char* formatString) {
	if (!formatString) {
		return RENDER_FORMAT_INVALID;
	} else if (strcmp(formatString, "RAW") == 0) {
		return RENDER_FORMAT_RAW;
	} else if (strcmp(formatString, "PNG") == 0) {
		return RENDER_FORMAT_PNG;
	} else if (strcmp(formatString, "JPEG") == 0) {
		return RENDER_FORMAT_JPEG;
	} else if (strcmp(formatString, "PDF") == 0) {
		return RENDER_FORMAT_PDF;
	} else if (strcmp(formatString, "SVG") == 0) {
		return RENDER_FORMAT_SVG;
	} else if (strcmp(formatString, "VIPS") == 0) {
		return RENDER_FORMAT_VIPS;
	} else {
		return RENDER_FORMAT_INVALID;
	}
}

static cairo_format_t CairoFormatFromString(const char* formatString) {
	if (!formatString) {
		return CAIRO_FORMAT_INVALID;
	} else if (strcmp(formatString, "ARGB32") == 0) {
		return CAIRO_FORMAT_ARGB32;
	} else if (strcmp(formatString, "RGB24") == 0) {
		return CAIRO_FORMAT_RGB24;
	} else if (strcmp(formatString, "A8") == 0) {
		return CAIRO_FORMAT_A8;
	} else if (strcmp(formatString, "A1") == 0) {
		return CAIRO_FORMAT_A1;
	} else if (strcmp(formatString, "RGB16_565") == 0) {
		return CAIRO_FORMAT_RGB16_565;
	} else if (strcmp(formatString, "RGB30") == 0) {
		return CAIRO_FORMAT_RGB30;
	} else {
		return CAIRO_FORMAT_INVALID;
	}
}

static Handle<Value> CairoFormatToString(cairo_format_t format) {
	const char* formatString =
		format == CAIRO_FORMAT_ARGB32 ? "ARGB32" :
		format == CAIRO_FORMAT_RGB24 ? "RGB24" :
		format == CAIRO_FORMAT_A8 ? "A8" :
		format == CAIRO_FORMAT_A1 ? "A1" :
		format == CAIRO_FORMAT_RGB16_565 ? "RGB16_565" :
		format == CAIRO_FORMAT_RGB30 ? "RGB30" :
		NULL;

	return formatString ? String::New(formatString) : Null();
}

Persistent<Function> RsvgHandleJS::constructor;

RsvgHandleJS::RsvgHandleJS(RsvgHandle* const handle) : _handle(handle) {}

RsvgHandleJS::~RsvgHandleJS() {
	g_object_unref(G_OBJECT(_handle));
}

void RsvgHandleJS::Init(Handle<Object> exports) {
	// Prepare constructor template.
	Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
	tpl->SetClassName(String::NewSymbol("RsvgHandle"));
	tpl->InstanceTemplate()->SetInternalFieldCount(1);
	// Add methods to prototype.
	Local<ObjectTemplate> prototype = tpl->PrototypeTemplate();
	prototype->Set("getBaseURI", FunctionTemplate::New(GetBaseURI)->GetFunction());
	prototype->Set("setBaseURI", FunctionTemplate::New(SetBaseURI)->GetFunction());
	prototype->Set("getDPI", FunctionTemplate::New(GetDPI)->GetFunction());
	prototype->Set("setDPI", FunctionTemplate::New(SetDPI)->GetFunction());
	prototype->Set("getDPIX", FunctionTemplate::New(GetDPIX)->GetFunction());
	prototype->Set("setDPIX", FunctionTemplate::New(SetDPIX)->GetFunction());
	prototype->Set("getDPIY", FunctionTemplate::New(GetDPIY)->GetFunction());
	prototype->Set("setDPIY", FunctionTemplate::New(SetDPIY)->GetFunction());
	prototype->Set("getWidth", FunctionTemplate::New(GetWidth)->GetFunction());
	prototype->Set("getHeight", FunctionTemplate::New(GetHeight)->GetFunction());
	prototype->Set("write", FunctionTemplate::New(Write)->GetFunction());
	prototype->Set("close", FunctionTemplate::New(Close)->GetFunction());
	prototype->Set("dimensions", FunctionTemplate::New(Dimensions)->GetFunction());
	prototype->Set("hasElement", FunctionTemplate::New(HasElement)->GetFunction());
	prototype->Set("render", FunctionTemplate::New(Render)->GetFunction());
	// Export class.
	constructor = Persistent<Function>::New(tpl->GetFunction());
	exports->Set(String::New("RsvgHandle"), constructor);
}

Handle<Value> RsvgHandleJS::New(const Arguments& args) {
	HandleScope scope;

	if (args.IsConstructCall()) {
		// Invoked as constructor: `new RsvgHandleJS(...)`
		RsvgHandle* handle;
		if (node::Buffer::HasInstance(args[0])) {
			const guint8* buffer =
				reinterpret_cast<guint8*>(node::Buffer::Data(args[0]));
			gsize length = node::Buffer::Length(args[0]);

			GError* error = NULL;
			handle = rsvg_handle_new_from_data(buffer, length, &error);

			if (error) {
				ThrowException(Exception::Error(String::New(error->message)));
				g_error_free(error);
				return scope.Close(Undefined());
			}
		} else {
			handle = rsvg_handle_new();
		}
		// Error handling.
		if (!handle) {
			ThrowException(Exception::Error(String::New(
				"Unable to create RsvgHandle instance."
			)));
			return scope.Close(Undefined());
		}
		// Create object.
		RsvgHandleJS* obj = new RsvgHandleJS(handle);
		obj->Wrap(args.This());
		return scope.Close(args.This());
	} else {
		// Invoked as plain function `RsvgHandleJS(...)`, turn into construct call.
		const int argc = 1;
		Local<Value> argv[argc] = { args[0] };
		return scope.Close(constructor->NewInstance(argc, argv));
	}
}

Handle<Value> RsvgHandleJS::GetBaseURI(const Arguments& args) {
	return GetStringProperty(args, "base-uri");
}

Handle<Value> RsvgHandleJS::SetBaseURI(const Arguments& args) {
	return SetStringProperty(args, "base-uri");
}

Handle<Value> RsvgHandleJS::GetDPI(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gdouble dpiX = 0;
	gdouble dpiY = 0;
	g_object_get(
		G_OBJECT(obj->_handle),
		"dpi-x", &dpiX,
		"dpi-y", &dpiY,
		NULL
	);

	Handle<ObjectTemplate> dpi = ObjectTemplate::New();
	dpi->SetInternalFieldCount(2);
	dpi->Set("x", Number::New(dpiX));
	dpi->Set("y", Number::New(dpiY));

	return scope.Close(dpi->NewInstance());
}

Handle<Value> RsvgHandleJS::SetDPI(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());

	gdouble x = args[0]->NumberValue();
	if (std::isnan(x)) {
		x = 0;
	}

	gdouble y = x;
	if (args[1]->IsNumber()) {
		y = args[1]->NumberValue();
		if (std::isnan(y)) {
			y = 0;
		}
	}

	rsvg_handle_set_dpi_x_y(obj->_handle, x, y);
	return scope.Close(Undefined());
}

Handle<Value> RsvgHandleJS::GetDPIX(const Arguments& args) {
	return GetNumberProperty(args, "dpi-x");
}

Handle<Value> RsvgHandleJS::SetDPIX(const Arguments& args) {
	return SetNumberProperty(args, "dpi-x");
}

Handle<Value> RsvgHandleJS::GetDPIY(const Arguments& args) {
	return GetNumberProperty(args, "dpi-y");
}

Handle<Value> RsvgHandleJS::SetDPIY(const Arguments& args) {
	return SetNumberProperty(args, "dpi-y");
}

Handle<Value> RsvgHandleJS::GetWidth(const Arguments& args) {
	return GetIntegerProperty(args, "width");
}

Handle<Value> RsvgHandleJS::GetHeight(const Arguments& args) {
	return GetIntegerProperty(args, "height");
}

Handle<Value> RsvgHandleJS::Write(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	if (node::Buffer::HasInstance(args[0])) {
		const guchar* buffer =
			reinterpret_cast<guchar*>(node::Buffer::Data(args[0]));
		gsize length = node::Buffer::Length(args[0]);

		GError* error = NULL;
		gboolean success = rsvg_handle_write(obj->_handle, buffer, length, &error);

		if (error) {
			ThrowException(Exception::Error(String::New(error->message)));
			g_error_free(error);
		} else if (!success) {
			ThrowException(Exception::Error(String::New("Failed to write data.")));
		}
	} else {
		ThrowException(Exception::TypeError(String::New("Invalid argument: buffer")));
	}
	return scope.Close(Undefined());
}

Handle<Value> RsvgHandleJS::Close(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());

	GError* error = NULL;
	gboolean success = rsvg_handle_close(obj->_handle, &error);

	if (error) {
		ThrowException(Exception::Error(String::New(error->message)));
		g_error_free(error);
	} else if (!success) {
		ThrowException(Exception::Error(String::New("Failed to close.")));
	}
	return scope.Close(Undefined());
}

Handle<Value> RsvgHandleJS::Dimensions(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());

	const char* id = NULL;
	String::Utf8Value idArg(args[0]);
	if (!(args[0]->IsUndefined() || args[0]->IsNull())) {
		id = *idArg;
		if (!id) {
			ThrowException(Exception::TypeError(String::New("Invalid argument: id")));
			return scope.Close(Undefined());
		}
	}

	RsvgPositionData _position = { 0, 0 };
	RsvgDimensionData _dimensions = { 0, 0, 0, 0 };

	gboolean hasPosition = rsvg_handle_get_position_sub(obj->_handle, &_position, id);
	gboolean hasDimensions = rsvg_handle_get_dimensions_sub(obj->_handle, &_dimensions, id);

	if (hasPosition || hasDimensions) {
		int fields = (hasPosition ? 2 : 0) + (hasDimensions ? 2 : 0);
		Handle<ObjectTemplate> dimensions = ObjectTemplate::New();
		dimensions->SetInternalFieldCount(fields);
		if (hasPosition) {
			dimensions->Set("x", Integer::New(_position.x));
			dimensions->Set("y", Integer::New(_position.y));
		}
		if (hasDimensions) {
			dimensions->Set("width", Integer::New(_dimensions.width));
			dimensions->Set("height", Integer::New(_dimensions.height));
		}
		return scope.Close(dimensions->NewInstance());
	} else {
		return scope.Close(Null());
	}
}

Handle<Value> RsvgHandleJS::HasElement(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());

	const char* id = NULL;
	String::Utf8Value idArg(args[0]);
	if (!(args[0]->IsUndefined() || args[0]->IsNull())) {
		id = *idArg;
		if (!id) {
			ThrowException(Exception::TypeError(String::New("Invalid argument: id")));
			return scope.Close(Undefined());
		}
	}

	gboolean exists = rsvg_handle_has_sub(obj->_handle, id);
	return scope.Close(Boolean::New(exists));
}

Handle<Value> RsvgHandleJS::Render(const Arguments& args) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());

	int width = args[0]->Int32Value();
	int height = args[1]->Int32Value();

	if (width <= 0) {
		ThrowException(Exception::RangeError(String::New("Expected width > 0.")));
		return scope.Close(Undefined());
	}
	if (height <= 0) {
		ThrowException(Exception::RangeError(String::New("Expected height > 0.")));
		return scope.Close(Undefined());
	}

	String::Utf8Value formatArg(args[2]);
	const char* formatString = *formatArg;
	render_format_t renderFormat = RenderFormatFromString(formatString);
	cairo_format_t rawFormat = CAIRO_FORMAT_INVALID;
	if (renderFormat == RENDER_FORMAT_RAW ||
			renderFormat == RENDER_FORMAT_PNG) {
		rawFormat = CAIRO_FORMAT_ARGB32;
	} else if (renderFormat == RENDER_FORMAT_JPEG) {
		ThrowException(Exception::Error(String::New("Format new yet supported: JPEG")));
		return scope.Close(Undefined());
	} else if (renderFormat == RENDER_FORMAT_PDF) {
		ThrowException(Exception::Error(String::New("Format new yet supported: PDF")));
		return scope.Close(Undefined());
	} else if (renderFormat == RENDER_FORMAT_SVG) {
		ThrowException(Exception::Error(String::New("Format new yet supported: SVG")));
		return scope.Close(Undefined());
	} else if (renderFormat == RENDER_FORMAT_VIPS) {
		ThrowException(Exception::Error(String::New("Format new yet supported: VIPS")));
		return scope.Close(Undefined());
	} else if (renderFormat == RENDER_FORMAT_INVALID) {
		renderFormat = RENDER_FORMAT_RAW;
		rawFormat = CairoFormatFromString(formatString);
		if (rawFormat == CAIRO_FORMAT_INVALID) {
			ThrowException(Exception::RangeError(String::New("Invalid argument: format")));
			return scope.Close(Undefined());
		}
	}

	const char* id = NULL;
	String::Utf8Value idArg(args[3]);
	if (!(args[3]->IsUndefined() || args[3]->IsNull())) {
		id = *idArg;
		if (!id) {
			ThrowException(Exception::TypeError(String::New("Invalid argument: id")));
			return scope.Close(Undefined());
		}
		if (!rsvg_handle_has_sub(obj->_handle, id)) {
			ThrowException(Exception::RangeError(String::New(
				"SVG element with given id does not exists."
			)));
			return scope.Close(Undefined());
		}
	}

	RsvgPositionData position = { 0, 0 };
	RsvgDimensionData dimensions = { 0, 0, 0, 0 };

	if (!rsvg_handle_get_position_sub(obj->_handle, &position, id)) {
		ThrowException(Exception::Error(String::New(
			"Could not get position of SVG element with given id."
		)));
		return scope.Close(Undefined());
	}

	if (!rsvg_handle_get_dimensions_sub(obj->_handle, &dimensions, id)) {
		ThrowException(Exception::Error(String::New(
			"Could not get dimensions of SVG element or whole image."
		)));
		return scope.Close(Undefined());
	}
	if (dimensions.width <= 0 || dimensions.height <= 0) {
		ThrowException(Exception::Error(String::New(
			"Got invalid dimensions of SVG element or whole image."
		)));
		return scope.Close(Undefined());
	}

	cairo_surface_t* surface = cairo_image_surface_create(rawFormat, width, height);
	cairo_t* cr = cairo_create(surface);
	// printf(
	// 	"%s: (%d, %d) %dx%d, render: %dx%d\n",
	// 	id ? id : "SVG",
	// 	position.x,
	// 	position.y,
	// 	dimensions.width,
	// 	dimensions.height,
	// 	width,
	// 	height
	// );
	double scaleX = double(width) / double(dimensions.width);
	double scaleY = double(height) / double(dimensions.height);
	// printf("scale=%.3fx%.3f\n", scaleX, scaleY);
	double scale = MIN(scaleX, scaleY);
	int bboxWidth = round(scale * dimensions.width);
	int bboxHeight = round(scale * dimensions.height);
	int bboxX = (width - bboxWidth) / 2;
	int bboxY = (height - bboxHeight) / 2;
	// printf("bbox=(%d, %d) %dx%d\n", bboxX, bboxY, bboxWidth, bboxHeight);
	cairo_translate(cr, bboxX, bboxY);
	cairo_scale(cr, scale, scale);
	cairo_translate(cr, -position.x, -position.y);

	gboolean success;
	if (id) {
		success = rsvg_handle_render_cairo_sub(obj->_handle, cr, id);
	} else {
		success = rsvg_handle_render_cairo(obj->_handle, cr);
	}

	cairo_status_t status = cairo_status(cr);
	if (status || !success) {
		ThrowException(Exception::Error(String::New(
			status ? cairo_status_to_string(status) : "Failed to render image."
		)));
		cairo_destroy(cr);
		cairo_surface_destroy(surface);
		return scope.Close(Undefined());
	}

	cairo_surface_flush(surface);
	cairo_surface_write_to_png(surface, "test.png");

	char* data = reinterpret_cast<char*>(cairo_image_surface_get_data(surface));
	rawFormat = cairo_image_surface_get_format(surface);
	width = cairo_image_surface_get_width(surface);
	height = cairo_image_surface_get_width(surface);
	int stride = cairo_image_surface_get_stride(surface);
	size_t length = stride * height;

	cairo_destroy(cr);
	cairo_surface_destroy(surface);

	Handle<ObjectTemplate> image = ObjectTemplate::New();
	image->SetInternalFieldCount(5);
	image->Set("data", node::Buffer::New(data, length)->handle_);
	image->Set("format", CairoFormatToString(rawFormat));
	image->Set("width", Integer::New(width));
	image->Set("height", Integer::New(height));
	image->Set("stride", Integer::New(stride));
	return scope.Close(image->NewInstance());
}

Handle<Value> RsvgHandleJS::GetStringProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gchar* value = NULL;
	g_object_get(G_OBJECT(obj->_handle), property, &value, NULL);
	Handle<Value> result(value ? String::New(value) : Null());
	if (value) {
		g_free(value);
	}
	return scope.Close(result);
}

Handle<Value> RsvgHandleJS::SetStringProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gchar* value = NULL;
	String::Utf8Value arg0(args[0]);
	if (!(args[0]->IsNull() || args[0]->IsUndefined())) {
		value = *arg0;
	}
	g_object_set(G_OBJECT(obj->_handle), property, value, NULL);
	return scope.Close(Undefined());
}

Handle<Value> RsvgHandleJS::GetNumberProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gdouble value = 0;
	g_object_get(G_OBJECT(obj->_handle), property, &value, NULL);
	return scope.Close(Number::New(value));
}

Handle<Value> RsvgHandleJS::SetNumberProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gdouble value = args[0]->NumberValue();
	if (std::isnan(value)) {
		value = 0;
	}
	g_object_set(G_OBJECT(obj->_handle), property, value, NULL);
	return scope.Close(Undefined());
}

Handle<Value> RsvgHandleJS::GetIntegerProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gint value = 0;
	g_object_get(G_OBJECT(obj->_handle), property, &value, NULL);
	return scope.Close(Integer::New(value));
}

Handle<Value> RsvgHandleJS::SetIntegerProperty(const Arguments& args, const char* property) {
	HandleScope scope;
	RsvgHandleJS* obj = node::ObjectWrap::Unwrap<RsvgHandleJS>(args.This());
	gint value = args[0]->Int32Value();
	g_object_set(G_OBJECT(obj->_handle), property, value, NULL);
	return scope.Close(Undefined());
}
