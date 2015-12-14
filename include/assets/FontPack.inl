#include "FontPack.h"
#include "Font.h"
#include "ftinclude.h"

#define HRES  64
#define DPI   72

namespace grynca {

    struct FT_RAII {
        FT_RAII() : library(NULL), face(NULL) {}

        FT_Error initLibrary() {
            return FT_Init_FreeType(&library);
        }

        FT_Error initFont(const Path& filepath) {
            return FT_New_Face(library, filepath.getPath().c_str(), 0, &face);
        }

        ~FT_RAII() {
            if (face)
                FT_Done_Face(face);
            if (library)
                FT_Done_FreeType(library);
        }

        FT_Library library;
        FT_Face face;
    };

    inline FontSize::FontSize(uint32_t size)
     : from_(size), to_(size)
    {}

    inline FontSize::FontSize(uint32_t size_from, uint32_t size_to)
     : from_(size_from), to_(size_to)
    {}

    inline uint32_t FontSize::getFrom()const {
        return from_;
    }

    inline uint32_t FontSize::getTo()const {
        return to_;
    }

    inline FontPack::FontPack()
     : chars_to_load_(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"),
       font_(NULL)
    {}

    inline FontPack::FontPack(const Path& font_path, const fast_vector<FontSize>& sizes, uint32_t texture_w)
     : FontPack()
    {
        loadFont(font_path, sizes, texture_w);
    }

    inline FontPack::~FontPack() {
        if (font_)
            delete font_;
    }

    inline bool FontPack::isNull()const {
        return font_!=NULL;
    }

    inline const Font&FontPack::getFont()const {
        return *font_;
    }

    inline bool FontPack::loadFont(const Path& font_path, const fast_vector<FontSize>& sizes, uint32_t texture_w) {
        FT_RAII ft;
        FT_Error error = ft.initLibrary();
        if (error) {
            std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
            return false;
        }
        error = ft.initFont(font_path);
        if (error) {
            std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
            return false;
        }
        Path p = font_path;
        p.removeExtension();
        std::string fontname = p.getFilename();

        if (font_)
            delete font_;
        font_ = new Font(fontname);

        TexturePacker packer(texture_w, GL_ALPHA);

        // select unicode charmap
        error = FT_Select_Charmap(ft.face, FT_ENCODING_UNICODE);
        if (error) {
            std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
            return false;
        }

        fast_vector<Glyph*> glyphs; // indexed with region-id

        for (auto it=sizes.begin(); it!=sizes.end(); ++it) {
            for (uint32_t size=it->getFrom(); size<=it->getTo(); ++size) {
                if (font_->containsSizedFont(size))
                    continue;
                SizedFont& sized_font = font_->addSize(size);
                // set font size
                error = FT_Set_Char_Size(ft.face, (int)(size * HRES), 0, DPI, DPI);
                if (error) {
                    std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
                    return false;
                }

                for (unsigned int i=0; i<chars_to_load_.size(); ++i) {
                    FT_UInt glyph_index = FT_Get_Char_Index(ft.face, (uint32_t)chars_to_load_[i]);
                    error = FT_Load_Glyph(ft.face, glyph_index, FT_LOAD_DEFAULT );
                    if (error) {
                        std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
                        return false;
                    }
                    error = FT_Render_Glyph( ft.face->glyph, FT_RENDER_MODE_NORMAL);
                    if (error) {
                        std::cerr << "[FontPack::loadFont]: " << getFreeTypeErrorMsg(error) << std::endl;
                        return false;
                    }

                    FT_GlyphSlot slot = ft.face->glyph;
                    // pack glyph bitmap to texture
                    unsigned int w = slot->bitmap.width;
                    unsigned int h = slot->bitmap.rows;
                    int32_t reg_id = packer.addRegion(w, h, slot->bitmap.buffer, true);
                    if (reg_id<0) {
                        std::cout << "[FontPack::loadFont] no space for glyph in packer." << std::endl;
                        return false;
                    }
                    const ARect& rect = packer.getRegions()[reg_id].getRect();

                    Glyph& curr_glyph = sized_font.addGlyph(chars_to_load_[i], rect,
                                                            slot->bitmap_left, slot->bitmap_top,
                                                            slot->advance.x/(float)HRES);

                    if (reg_id >= glyphs.size())
                        glyphs.resize(uint32_t(reg_id)+1, NULL);
                    glyphs[reg_id] = &curr_glyph;

                    // get kernings
                    FT_Vector kerning;
                    for (size_t j=0; j<i; ++j) {
                        char prev_char = chars_to_load_[j];
                        Glyph& prev_glyph = sized_font.getGlyph(prev_char);

                        FT_UInt prev_glyph_index = FT_Get_Char_Index(ft.face, (uint32_t)prev_glyph.getCharcode());
                        // kerning when prev_glyph is on left
                        FT_Get_Kerning( ft.face, prev_glyph_index, glyph_index, FT_KERNING_UNFITTED, &kerning );
                        if(kerning.x)
                            prev_glyph.addKerning(Kerning{chars_to_load_[i], (float)kerning.x/(float)HRES});

                        if (prev_glyph_index != glyph_index) {
                            // only when glyphs are different add the other way around

                            // kerning when prev_glyph is on right
                            FT_Get_Kerning( ft.face, glyph_index, prev_glyph_index, FT_KERNING_UNFITTED, &kerning );
                            if (kerning.x)
                                curr_glyph.addKerning(Kerning{prev_char, (float)kerning.x/(float)HRES});
                        }
                    }
                }
            }
        }

        pack_image_ = new Image(packer.getTextureWidth(), packer.getTextureHeight(), packer.getFormat());
        pack_image_->fillWithColor({0, 0, 0, 0});
        packer.packData(pack_image_->getDataPtr(), pack_image_->getPitch());

        // set texture regions to glyphs
        for (uint32_t i=0; i<glyphs.size(); ++i) {
            if (!glyphs[i])
                continue;
            glyphs[i]->getRegion().setTextureRect(packer.getRegions()[i].getTextureRect());
        }

        return true;
    }

    inline const std::string&FontPack::getCharsToLoad()const {
        return chars_to_load_;
    }

    inline void FontPack::setCharsToLoad(const std::string& chtl) {
        chars_to_load_ = chtl;
    }

    inline Image::Ref FontPack::getPackImage() {
        return pack_image_;
    }

}