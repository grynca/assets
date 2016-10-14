#include "FontsPacks.h"
#include "FontPack.h"

namespace grynca {
    inline FontsPacks::FontsPacks(AssetsManager& am)
     : manager_(&am)
    {}

    inline AssetsManager& FontsPacks::getManager() {
        return *manager_;
    }

    inline FontPack* FontsPacks::findByFontname(const std::string& fontname) {
        for (uint32_t i=0; i<getItemsCount(); ++i) {
            FontPack* fp = getItemAtPos(i);
            if (!fp || fp->isNull())
                continue;
            if (fp->getFont().getFontname() == fontname)
                return fp;
        }
        return NULL;
    }
}