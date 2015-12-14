#ifndef FONTSPACKS_H
#define FONTSPACKS_H

#include "types/Manager.h"

namespace grynca {

    // fw
    class FontPack;
    class AssetsManager;

    class FontsPacks : public Manager<FontPack> {
    public:
        FontsPacks(AssetsManager& am);
        AssetsManager& getManager();
        FontPack* findByFontname(const std::string& fontname);
    private:
        AssetsManager* manager_;
    };
}

#include "FontsPacks.inl"
#endif //FONTSPACKS_H
