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
        FontSize(uint32_t size);
        FontSize(uint32_t size_from, uint32_t size_to);

        uint32_t getFrom()const;
        uint32_t getTo()const;
    private:
        uint32_t from_;
        uint32_t to_;
    };

    class FontPack : public ManagedItem<FontsPacks> {
    public:
        FontPack();
        FontPack(const Path& font_path, const fast_vector<FontSize>& sizes, uint32_t texture_w = 2048);
        ~FontPack();


        bool isNull()const;
        const Font& getFont()const;

        bool loadFont(const Path& font_path, const fast_vector<FontSize>& sizes, uint32_t texture_w = 2048);

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
