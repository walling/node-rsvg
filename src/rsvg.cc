
#include "RsvgHandleJS.h"
#include <node.h>

using namespace v8;

void InitAll(Handle<Object> exports) {
	RsvgHandleJS::Init(exports);
}

NODE_MODULE(rsvg, InitAll)
