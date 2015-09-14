#ifndef FONTSPACKS_H
#define FONTSPACKS_H

#include "types/Manager.h"
#include "FontPack.h"

namespace grynca {

    // fw
    class FontPack;
    class AssetsManager;

    class FontsPacks : public Manager<FontPack> {
    public:
        FontsPacks(AssetsManager& am) : manager_(&am) {}

        AssetsManager& getManager() { return *manager_; }

        FontPack * findByFontname(const std::string& fontname) {
            for (uint32_t i=0; i<getItemsCount(); ++i) {
                FontPack & fp = getItemAtPos(i);
                if (fp.isNull())
                    continue;
                if (fp.getFont().getFontname() == fontname)
                    return &fp;
            }
            return NULL;
        }
    private:
        AssetsManager* manager_;
    };

}

#endif //FONTSPACKS_H
