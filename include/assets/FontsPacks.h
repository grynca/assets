#ifndef FONTSPACKS_H
#define FONTSPACKS_H

#include "types/Manager.h"

namespace grynca {

    // fw
    class FontPack;
    class AssetsManagerBase;

    class FontsPacks : public Manager<FontPack> {
    public:
        FontsPacks(AssetsManagerBase& am);
        AssetsManagerBase& getManager();
        FontPack* findByFontname(const std::string& fontname);
    private:
        AssetsManagerBase* manager_;
    };
}

#include "FontsPacks.inl"
#endif //FONTSPACKS_H
