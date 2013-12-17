#ifndef __RSVGCAIRO_H__
#define __RSVGCAIRO_H__

#include <librsvg/rsvg.h>

// Hack to ignore warning message. It's deprecated to include the rsvg-cairo.h
// file directly, but we need to do this in order to support older versions.
#define __RSVG_RSVG_H_INSIDE__
#include <librsvg/rsvg-cairo.h>
#undef __RSVG_RSVG_H_INSIDE__

#endif /*__RSVGCAIRO_H__*/