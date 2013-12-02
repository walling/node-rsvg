{
	"targets": [
		{
			"target_name": "rsvg",
			"sources": [
				"src/Rsvg.cc"
			],
			"variables": {
				"packages": "librsvg-2.0 cairo-png cairo-pdf cairo-svg",
				"libraries": "<!(pkg-config --libs-only-l <(packages))",
				"ldflags": "<!(pkg-config --libs-only-L --libs-only-other <(packages))",
				"cflags": "<!(pkg-config --cflags <(packages))"
			},
			"libraries": [
				"<@(libraries)"
			],
			"conditions": [
				[ "OS=='linux'", {
					"cflags": [
						"<@(cflags)"
					],
					"ldflags": [
						"<@(ldflags)"
					]
				} ],
				[ "OS=='mac'", {
					"xcode_settings": {
						"OTHER_CFLAGS": [
							"<@(cflags)"
						],
						"OTHER_LDFLAGS": [
							"<@(ldflags)"
						]
					}
				} ]
			]
		}
	]
}