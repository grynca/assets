cmake_minimum_required(VERSION 3.2)
project(assets)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -std=gnu++0x" )
# for profiling
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -fno-omit-frame-pointer -gdwarf-2" )

include_directories(/home/grynca/DEV/gamedev/base/src/)
include_directories(/home/grynca/DEV/gamedev/maths/src/)
include_directories(include/)
include_directories(/usr/include/freetype2)

set(LIBS "-lfreetype -lSDL2 -lSDL2_image")

set(SOURCE_FILES
        test/main.cpp


        include/assets.h
        include/assets/Image.h
        include/assets/Image.inl
        include/assets/SkylinePacker.h
        include/assets/SkylinePacker.inl
        include/assets/TexturePacker.h
        include/assets/TexturePacker.inl
        include/assets/ImagesPack.h
        include/assets/ImagesPack.inl
        include/assets/FontPack.h
        include/assets/FontPack.inl
        include/assets/ftinclude.h
        include/assets/Font.h
        include/assets/Font.inl
        include/assets/Animation.h
        include/assets/Animation.inl
        include/assets/AssetsManager.h
        include/assets/AssetsManager.inl
        include/assets/Animations.h
        include/assets/FontsPacks.h
        include/assets/FontsPacks.inl
        include/assets/ImagesPacks.h)
add_executable(assets ${SOURCE_FILES})
target_link_libraries(assets ${LIBS})