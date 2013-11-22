{
	"targets": [
		{
			"target_name": "rsvg",
			"sources": [
				"src/rsvg.cc",
				"src/RsvgHandleJS.cc"
			],
			"libraries": [
				"<!@(pkg-config --libs-only-l librsvg-2.0 cairo-pdf)"
			],
			"xcode_settings": {
				"OTHER_CFLAGS": [
					"<!@(pkg-config --cflags-only-I librsvg-2.0 cairo-pdf)"
				],
				"OTHER_LDFLAGS": [
					"<!@(pkg-config --libs-only-L --libs-only-other librsvg-2.0 cairo-pdf)"
				]
			}
		}
	]
}