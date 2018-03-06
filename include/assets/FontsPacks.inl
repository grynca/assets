#include "FontsPacks.h"
#include "FontPack.h"

namespace grynca {
    inline FontsPacks::FontsPacks(AssetsManagerBase& am)
     : manager_(&am)
    {}

    inline AssetsManagerBase& FontsPacks::getManager() {
        return *manager_;
    }

    inline FontPack* FontsPacks::findByFontname(const std::string& fontname) {
        for (u32 i=0; i<getItemsCount(); ++i) {
            FontPack* fp = accItemAtPos(i);
            if (!fp || fp->isNull())
                continue;
            if (fp->getFont().getFontname() == fontname)
                return fp;
        }
        return NULL;
    }
}