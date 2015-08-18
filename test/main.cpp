#include <iostream>
#include "base.h"
#include "assets.h"
using namespace std;
using namespace grynca;

int main(int argc, char* argv[]) {
    Image i("data/yoda.jpg");
    std::cout << i.getSize() << std::endl;

    for (uint32_t x=0; x<100; ++x)
        for (uint32_t y=50; y<100; ++y) {
        i.setPixel(x, y, {0,0,0,0});
    }

    i.saveToPNG("yoda_out.png");

    KEY_TO_CONTINUE();
    return 0;
}