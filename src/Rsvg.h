#ifndef __RSVG_H__
#define __RSVG_H__

#include <node.h>
#include <librsvg/rsvg.h>

class Rsvg : public node::ObjectWrap {
public:
	static void Init(v8::Handle<v8::Object> exports);

private:
	explicit Rsvg(RsvgHandle* const handle);
	~Rsvg();

	static v8::Handle<v8::Value> New(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetBaseURI(const v8::Arguments& args);
	static v8::Handle<v8::Value> SetBaseURI(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetDPI(const v8::Arguments& args);
	static v8::Handle<v8::Value> SetDPI(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetDPIX(const v8::Arguments& args);
	static v8::Handle<v8::Value> SetDPIX(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetDPIY(const v8::Arguments& args);
	static v8::Handle<v8::Value> SetDPIY(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetWidth(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetHeight(const v8::Arguments& args);
	static v8::Handle<v8::Value> Write(const v8::Arguments& args);
	static v8::Handle<v8::Value> Close(const v8::Arguments& args);
	static v8::Handle<v8::Value> Dimensions(const v8::Arguments& args);
	static v8::Handle<v8::Value> HasElement(const v8::Arguments& args);
	static v8::Handle<v8::Value> Autocrop(const v8::Arguments& args);
	static v8::Handle<v8::Value> Render(const v8::Arguments& args);
	static v8::Handle<v8::Value> GetStringProperty(const v8::Arguments& args, const char* property);
	static v8::Handle<v8::Value> SetStringProperty(const v8::Arguments& args, const char* property);
	static v8::Handle<v8::Value> GetNumberProperty(const v8::Arguments& args, const char* property);
	static v8::Handle<v8::Value> SetNumberProperty(const v8::Arguments& args, const char* property);
	static v8::Handle<v8::Value> GetIntegerProperty(const v8::Arguments& args, const char* property);
	static v8::Handle<v8::Value> SetIntegerProperty(const v8::Arguments& args, const char* property);
	static v8::Persistent<v8::Function> constructor;
	RsvgHandle* const _handle;
};

#endif /*__RSVG_H__*/