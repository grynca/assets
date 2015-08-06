cmake_minimum_required(VERSION 3.2)
project(assets)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -std=gnu++0x" )
# for profiling
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -fno-omit-frame-pointer -gdwarf-2" )

include_directories(c:/DEV/gamedev/base/src/)
include_directories(c:/DEV/gamedev/maths/src/)
include_directories(include/)
#glew
include_directories(c:/DEV/libs/mingw/glew-1.12.0/include/)
link_directories(c:/DEV/libs/mingw/glew-1.12.0/lib/)
#sdl
include_directories(c:/DEV/libs/mingw/SDL2-2.0.3/include/)
link_directories(c:/DEV/libs/mingw/SDL2-2.0.3/build/.libs/)
#sdl-image
include_directories(c:/DEV/libs/mingw/SDL2_image-2.0.0/)
link_directories(c:/DEV/libs/mingw/SDL2_image-2.0.0/.libs/)
#glm
include_directories(c:/DEV/libs/mingw/glm/)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DGLM_FORCE_RADIANS" )

set(LIBS "-lglew32 -lopengl32 -lglu32
          -lmingw32 -lSDL2main -lSDL2 -lSDL2_image")

set(SOURCE_FILES
    src/main.cpp
    include/assets/Image.h
    include/assets/Image.inl
    )
add_executable(assets ${SOURCE_FILES} include/assets.h)
target_link_libraries(assets ${LIBS})