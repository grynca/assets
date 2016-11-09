#include <iostream>
#include "base.h"
#include "assets.h"
using namespace std;
using namespace grynca;

int main(int argc, char* argv[]) {
    Image::Ref i = new Image("data/images/yoda.jpg");
    std::cout << i->getSize() << std::endl;

    for (u32 x=0; x<100; ++x)
        for (u32 y=50; y<100; ++y) {
        i->setPixel(x, y, {0,0,0,0});
    }
    i->saveToPNG("yoda_out.png");

    ImagesPack ip;
    ip.loadDir("data", GL_RGBA, 4096);
    ip.getPackImage()->saveToPNG("pack_out.png");
    ip.getImage("data/images/big-black-guy-scary-fat.jpg")->saveToPNG("quassil.png");

    FontPack fp("data/fonts/arial.ttf", {{10}, {14,20}, {25,30}});
    fp.getPackImage()->saveToPNG("font_texture_out.png");

    AssetsManager am;
    am.getImagesPacks().addItem("data/images", GL_RGBA, 4096);
    am.getAnimations().addItem().init({
                                   {"data/images/yoda.jpg", 5}
                               });

    WAIT_FOR_KEY_ON_WIN();
    return 0;
}