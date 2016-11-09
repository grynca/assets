#ifndef FONTSPACK_H
#define FONTSPACK_H

#include "types/Manager.h"
#include "Image.h"
#include "TexturePacker.h"
#include "types/Path.h"

namespace grynca {
    // fw
    class Font;
    class FontsPacks;

    class FontSize {
    public:
        FontSize(u32 size);
        FontSize(u32 size_from, u32 size_to);

        u32 getFrom()const;
        u32 getTo()const;
    private:
        u32 from_;
        u32 to_;
    };

    class FontPack : public ManagedItem<FontsPacks> {
    public:
        FontPack();
        FontPack(const Path& font_path, const fast_vector<FontSize>& sizes, u32 texture_w = 2048);
        ~FontPack();


        bool isNull()const;
        const Font& getFont()const;

        bool loadFont(const Path& font_path, const fast_vector<FontSize>& sizes, u32 texture_w = 2048);

        const std::string& getCharsToLoad()const;
        void setCharsToLoad(const std::string& chtl);
        Image::Ref getPackImage();
    private:
        std::string chars_to_load_;
        Font* font_;
        Image::Ref pack_image_;
    };

}

#include "FontPack.inl"
#endif //FONTSPACK_H
