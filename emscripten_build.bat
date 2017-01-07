mkdir build
cd build
mkdir Emscripten
cd ..
set EMCC_DEBUG=2
set FLAGS= -std=c++11 -DWEB -DGLM_FORCE_RADIANS -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s USE_LIBPNG=1 -s TOTAL_MEMORY=33554432 --use-preload-plugins --preload-file data  
emcc test/main.cpp %FLAGS% -Iinclude -Ic:/DEV/gamedev/base/src -Ic:/DEV/gamedev/maths/include -Ic:/DEV/libs/mingw/glm -Ic:/DEV/libs/mingw/freetype-2.6/include -Lc:/DEV/libs/emscripten/freetype-2.5.4/build -lfreetype -o build/Emscripten/main.html
