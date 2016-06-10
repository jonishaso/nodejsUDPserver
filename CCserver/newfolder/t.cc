#include <node.h>

using namespace v8;

void Method(const FunctionCallbackInfo<Value>& args)
{
	Isolate *isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	args.GetReturnValue().set(String::NewFormUft8(isolate,"world"));
}

void Handle (const Function<>)
{



}

MOUDLE_EXPORTS this;