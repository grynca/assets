cmake_minimum_required(VERSION 3.2)
project(assets)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DGLM_FORCE_RADIANS -std=c++14 -ffast-math -Wall -Werror" )

IF (CMAKE_BUILD_TYPE STREQUAL "Release")
    #disable profiling
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DNPROFILE" )
ENDIF()

IF (CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")
    IF (WIN32)
        # for profiling
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fno-omit-frame-pointer -gdwarf-2" )
    ENDIF()
ENDIF()

option(USE_SDL2 "Use SDL2" ON)
IF (USE_SDL2)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DUSE_SDL2=1" )
    IF (WIN32)
        set(LIBS "-lglew32 -lmingw32 -lSDL2main -lSDL2")
    ELSE()
        set(LIBS "-lGLEW -lGL -lGLU -lSDL2")
    ENDIF()
ENDIF()


IF (WIN32)
    include_directories(c:/DEV/gamedev/base/include/)
    include_directories(c:/DEV/gamedev/maths/include/)

    set(LIBS "${LIBS} -lfreetype -lSDL2_image")
ELSE()
    include_directories(/home/grynca/DEV/gamedev/base/include/)
    include_directories(/home/grynca/DEV/gamedev/maths/include/)
    include_directories(/usr/include/freetype2)

    set(LIBS "${LIBS} -lfreetype -lSDL2_image")
ENDIF()

include_directories(include/)


set(SOURCE_FILES
        test/main.cpp


        include/assets.h
        include/assets/assets_config.h
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
        include/assets/SpriteAnimation.h
        include/assets/SpriteAnimation.inl
        include/assets/AssetsManagerBase.h
        include/assets/AssetsManagerBase.inl
        include/assets/SpriteAnimations.h
        include/assets/SpriteAnimations.inl
        include/assets/FontsPacks.h
        include/assets/FontsPacks.inl
        include/assets/ImagesPacks.h
        )
add_executable(assets ${SOURCE_FILES})
target_link_libraries(assets ${LIBS})