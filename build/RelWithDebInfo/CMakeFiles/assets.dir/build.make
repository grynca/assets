# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.9

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /home/grynca/clion-2017.3.3/bin/cmake/bin/cmake

# The command to remove a file.
RM = /home/grynca/clion-2017.3.3/bin/cmake/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/grynca/DEV/gamedev/assets

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/grynca/DEV/gamedev/assets/build/RelWithDebInfo

# Include any dependencies generated for this target.
include CMakeFiles/assets.dir/depend.make

# Include the progress variables for this target.
include CMakeFiles/assets.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/assets.dir/flags.make

CMakeFiles/assets.dir/test/main.cpp.o: CMakeFiles/assets.dir/flags.make
CMakeFiles/assets.dir/test/main.cpp.o: ../../test/main.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/grynca/DEV/gamedev/assets/build/RelWithDebInfo/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/assets.dir/test/main.cpp.o"
	/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/assets.dir/test/main.cpp.o -c /home/grynca/DEV/gamedev/assets/test/main.cpp

CMakeFiles/assets.dir/test/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/assets.dir/test/main.cpp.i"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/grynca/DEV/gamedev/assets/test/main.cpp > CMakeFiles/assets.dir/test/main.cpp.i

CMakeFiles/assets.dir/test/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/assets.dir/test/main.cpp.s"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/grynca/DEV/gamedev/assets/test/main.cpp -o CMakeFiles/assets.dir/test/main.cpp.s

CMakeFiles/assets.dir/test/main.cpp.o.requires:

.PHONY : CMakeFiles/assets.dir/test/main.cpp.o.requires

CMakeFiles/assets.dir/test/main.cpp.o.provides: CMakeFiles/assets.dir/test/main.cpp.o.requires
	$(MAKE) -f CMakeFiles/assets.dir/build.make CMakeFiles/assets.dir/test/main.cpp.o.provides.build
.PHONY : CMakeFiles/assets.dir/test/main.cpp.o.provides

CMakeFiles/assets.dir/test/main.cpp.o.provides.build: CMakeFiles/assets.dir/test/main.cpp.o


# Object files for target assets
assets_OBJECTS = \
"CMakeFiles/assets.dir/test/main.cpp.o"

# External object files for target assets
assets_EXTERNAL_OBJECTS =

assets: CMakeFiles/assets.dir/test/main.cpp.o
assets: CMakeFiles/assets.dir/build.make
assets: CMakeFiles/assets.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/grynca/DEV/gamedev/assets/build/RelWithDebInfo/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable assets"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/assets.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/assets.dir/build: assets

.PHONY : CMakeFiles/assets.dir/build

CMakeFiles/assets.dir/requires: CMakeFiles/assets.dir/test/main.cpp.o.requires

.PHONY : CMakeFiles/assets.dir/requires

CMakeFiles/assets.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/assets.dir/cmake_clean.cmake
.PHONY : CMakeFiles/assets.dir/clean

CMakeFiles/assets.dir/depend:
	cd /home/grynca/DEV/gamedev/assets/build/RelWithDebInfo && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/grynca/DEV/gamedev/assets /home/grynca/DEV/gamedev/assets /home/grynca/DEV/gamedev/assets/build/RelWithDebInfo /home/grynca/DEV/gamedev/assets/build/RelWithDebInfo /home/grynca/DEV/gamedev/assets/build/RelWithDebInfo/CMakeFiles/assets.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/assets.dir/depend

