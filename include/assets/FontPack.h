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
        FontPack(const Path& font_path, const fast_vector<FontSize>& sizes, u32 texture_w = 2048, u32 texture_id = InvalidId());
        ~FontPack();


        bool isNull()const;
        const Font& getFont()const;

        bool loadFont(const Path& font_path, const fast_vector<FontSize>& sizes, u32 texture_w = 2048);

        const fast_vector<c8>& getCharsToLoad()const;
        void setCharsToLoad(const fast_vector<c8>& chtl);
        void setCharsToLoad(const std::string& chtl);
        Image::Ref getPackImage();

        // can set/get texture id for some purposes
        u32 getTextureId()const { return texture_id_; }
        void setTextureId(u32 tid) { texture_id_ = tid; }
    private:
        fast_vector<c8> chars_to_load_;
        Font* font_;
        Image::Ref pack_image_;
        u32 texture_id_;
    };

}

#include "FontPack.inl"
#endif //FONTSPACK_H
