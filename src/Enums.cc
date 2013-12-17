
#include "Enums.h"
#include "RsvgCairo.h"
#include <cstring>

// Support for old Cairo 1.8.8.
#ifndef CAIRO_FORMAT_INVALID
#define CAIRO_FORMAT_INVALID ((cairo_format_t) -1)
#endif

using namespace v8;

render_format_t RenderFormatFromString(const char* formatString) {
	if (!formatString) {
		return RENDER_FORMAT_INVALID;
	} else if (std::strcmp(formatString, "raw") == 0) {
		return RENDER_FORMAT_RAW;
	} else if (std::strcmp(formatString, "png") == 0) {
		return RENDER_FORMAT_PNG;
	} else if (std::strcmp(formatString, "jpeg") == 0) {
		return RENDER_FORMAT_JPEG;
	} else if (std::strcmp(formatString, "pdf") == 0) {
		return RENDER_FORMAT_PDF;
	} else if (std::strcmp(formatString, "svg") == 0) {
		return RENDER_FORMAT_SVG;
	} else if (std::strcmp(formatString, "vips") == 0) {
		return RENDER_FORMAT_VIPS;
	} else {
		return RENDER_FORMAT_INVALID;
	}
}

Handle<Value> RenderFormatToString(render_format_t format) {
	const char* formatString =
		format == RENDER_FORMAT_RAW ? "raw" :
		format == RENDER_FORMAT_PNG ? "png" :
		format == RENDER_FORMAT_JPEG ? "jpeg" :
		format == RENDER_FORMAT_PDF ? "pdf" :
		format == RENDER_FORMAT_SVG ? "svg" :
		format == RENDER_FORMAT_VIPS ? "vips" :
		NULL;

	return formatString ? String::New(formatString) : Null();
}

cairo_format_t CairoFormatFromString(const char* formatString) {
	if (!formatString) {
		return CAIRO_FORMAT_INVALID;
	} else if (std::strcmp(formatString, "argb32") == 0) {
		return CAIRO_FORMAT_ARGB32;
	} else if (std::strcmp(formatString, "rgb24") == 0) {
		return CAIRO_FORMAT_RGB24;
	} else if (std::strcmp(formatString, "a8") == 0) {
		return CAIRO_FORMAT_A8;
	} else if (std::strcmp(formatString, "a1") == 0) {
		return CAIRO_FORMAT_A1;
	} else if (std::strcmp(formatString, "rgb16_565") == 0) {
		return (cairo_format_t) CAIRO_FORMAT_RGB16_565;
#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 12, 0)
	} else if (std::strcmp(formatString, "rgb30") == 0) {
		return CAIRO_FORMAT_RGB30;
#endif
	} else {
		return CAIRO_FORMAT_INVALID;
	}
}

Handle<Value> CairoFormatToString(cairo_format_t format) {
	const char* formatString =
		format == CAIRO_FORMAT_ARGB32 ? "argb32" :
		format == CAIRO_FORMAT_RGB24 ? "rgb24" :
		format == CAIRO_FORMAT_A8 ? "a8" :
		format == CAIRO_FORMAT_A1 ? "a1" :
		format == CAIRO_FORMAT_RGB16_565 ? "rgb16_565" :
#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 12, 0)
		format == CAIRO_FORMAT_RGB30 ? "rgb30" :
#endif
		NULL;

	return formatString ? String::New(formatString) : Null();
}
