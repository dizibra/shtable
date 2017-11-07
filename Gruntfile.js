module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: 'shtable.js',
                    dest: 'dist'
                }]
            }
        },
        uglify: {
            main: {
                files: {
                    'dist/shtable.min.js': [
                        'src/shtable.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['uglify', 'copy']);
};