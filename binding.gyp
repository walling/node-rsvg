{
	"targets": [
		{
			"target_name": "rsvg",
			"sources": [
				"src/Rsvg.cc"
			],
			"variables": {
				"packages": "librsvg-2.0 cairo-png cairo-pdf cairo-svg"
			},
			"libraries": [
				"<!@(pkg-config --libs-only-l <(packages))"
			],
			"xcode_settings": {
				"OTHER_CFLAGS": [
					"<!@(pkg-config --cflags-only-I <(packages))"
				],
				"OTHER_LDFLAGS": [
					"<!@(pkg-config --libs-only-L --libs-only-other <(packages))"
				]
			}
		}
	]
}