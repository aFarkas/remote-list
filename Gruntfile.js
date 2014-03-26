/*global module:false*/
module.exports = function(grunt){

	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bower: grunt.file.readJSON('bower.json'),
		jq: grunt.file.readJSON('webshims.jquery.json'),
		meta: {
			banner: '/*! v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %> */'
		},
		copy: {
			demo: {
				src: 'src/remote-list.js',
				dest: 'dist/remote-list.js'
			}
		},

		uglify: {
			options: {
				beautify: {
					ascii_only : true
				},
				preserveComments: 'some'
			},
			demo: {
				src: 'dist/remote-list.js',
				dest: 'dist/remote-list.min.js'
			}
		},
		watch: {
			js: {
				files: ['src/**/*.js'],
				tasks: ['copy', 'uglify', 'bytesize']
			}
		},
		bytesize: {
			all: {
				src: [
					'dist/*'
				]
			}
		}
	});

	
	// Default task.

	

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bytesize');

	grunt.registerTask('default', ['copy', 'uglify', 'bytesize', 'watch']);



	function getFiles(srcdir, destdir, wildcard, compareDir, compareMatch) {
		var path = require('path');
		var fs = require('fs');
		// In Nodejs 0.8.0, existsSync moved from path -> fs.
		var existsSync = fs.existsSync || path.existsSync;
		var files = {};
		grunt.file.expand({cwd: srcdir}, wildcard).forEach(function(relpath) {
			var src = path.join(srcdir, relpath);
			
			if(!compareDir || !compareMatch || !grunt.file.isMatch(compareMatch, src) || (!existsSync(path.join(compareDir, relpath)) || grunt.file.read(src) != grunt.file.read(path.join(compareDir, relpath)))){
				files[destdir === false ? relpath : path.join(destdir, relpath)] = src;
			}
		});
		return files;
	}
	
	
};
