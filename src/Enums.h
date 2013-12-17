#ifndef __ENUMS_H__
#define __ENUMS_H__

#include <cairo.h>
#include <node.h>

typedef enum {
	RENDER_FORMAT_INVALID = -1,
	RENDER_FORMAT_RAW = 0,
	RENDER_FORMAT_PNG = 1,
	RENDER_FORMAT_JPEG = 2,
	RENDER_FORMAT_PDF = 3,
	RENDER_FORMAT_SVG = 4,
	RENDER_FORMAT_VIPS = 5
} render_format_t;

render_format_t RenderFormatFromString(const char* formatString);
v8::Handle<v8::Value> RenderFormatToString(render_format_t format);
cairo_format_t CairoFormatFromString(const char* formatString);
v8::Handle<v8::Value> CairoFormatToString(cairo_format_t format);

#endif /*__ENUMS_H__*/