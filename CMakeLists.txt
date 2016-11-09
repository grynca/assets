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

include_directories(include/)
IF (WIN32)
    include_directories(c:/DEV/gamedev/base/src/)
    include_directories(c:/DEV/gamedev/maths/include/)
    include_directories(c:/DEV/libs/mingw/glm/)
    include_directories(c:/DEV/libs/mingw/glew-1.13.0/include/)
    link_directories(c:/DEV/libs/mingw/glew-1.13.0/lib/)
    include_directories(c:/DEV/libs/mingw/freetype-2.6/include/)
    link_directories(c:/DEV/libs/mingw/freetype-2.6/lib/)
    include_directories(c:/DEV/libs/mingw/SDL2-2.0.4/x86/include/)
    link_directories(c:/DEV/libs/mingw/SDL2-2.0.4/x86/lib)

    set(LIBS "-lfreetype -lglew32 -lmingw32 -lSDL2main -lSDL2 -lSDL2_image")
ELSE()
    include_directories(/home/grynca/DEV/gamedev/base/src/)
    include_directories(/home/grynca/DEV/gamedev/maths/include/)
    include_directories(/usr/include/freetype2)

    set(LIBS "-lfreetype -lSDL2 -lSDL2_image")
ENDIF()


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