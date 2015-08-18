mkdir build
cd build
mkdir Emscripten
cd ..
set EMCC_DEBUG=2
emcc test/main.cpp -O2 -std=c++11 -DWEB -Iinclude -Ic:/DEV/gamedev/base/src -Ic:/DEV/gamedev/maths/src -Ic:/DEV/libs/mingw/glm -DGLM_FORCE_RADIANS --preload-file data -s USE_SDL=2 -s USE_SDL_IMAGE=2 -o build/Emscripten/main.html
