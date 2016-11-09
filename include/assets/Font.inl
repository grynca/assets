#include "Font.h"

namespace grynca {

    inline char Glyph::getCharcode()const {
        return charcode_;
    }

    inline TextureRegion& Glyph::getRegion() {
        return region_;
    }

    inline const TextureRegion& Glyph::getRegion()const  {
        return region_;
    }

    inline int Glyph::getOffsetX()const {
        return offset_x_;
    }

    inline int Glyph::getOffsetY()const {
        return offset_y_;
    }

    inline f32 Glyph::getAdvanceX()const {
        return advance_x_;
    }

    inline f32 Glyph::getKerning(char charcode)const {
        fast_vector<Kerning>::const_iterator it = std::find_if(kernings_.begin(), kernings_.end(), [charcode](const Kerning& k) {
            return k.charcode==charcode;
        });

        if (it==kernings_.end())
            return 0.0f;
        return it->value;
    }

    inline void Glyph::addKerning(const Kerning& kerning) {
        kernings_.push_back(kerning);
    }

    inline Glyph::Glyph()
     : charcode_(0), offset_x_(0), offset_y_(0), advance_x_(0)
    {}

    inline Glyph::Glyph(char charcode, const ARect& region, int offset_x, int offset_y, f32 advance_x)
     : charcode_(charcode), offset_x_(offset_x), offset_y_(offset_y), advance_x_(advance_x)
    {
        region_.setRect(region);
    }

    inline SizedFont::~SizedFont() {
        for (size_t i=0; i<glyphs_.size(); ++i) {
            if (glyphs_[i])
                delete glyphs_[i];
        }
    }

    inline bool SizedFont::containsGlyph(char charcode)const {
        if ((u8)charcode >= glyphs_.size())
            return false;
        return glyphs_[charcode] != NULL;
    }

    inline std::string SizedFont::getCharcodes()const {
        std::string charcodes_out;
        for (unsigned char i=0; i<glyphs_.size(); ++i) {
            if (glyphs_[i])
                charcodes_out.push_back(i);
        }
        return charcodes_out;
    }

    inline Glyph& SizedFont::getGlyph(char charcode) {
        ASSERT_M(containsGlyph(charcode), "Sized font does not contain desired glyph.");
        return *glyphs_[charcode];
    }

    inline const Glyph& SizedFont::getGlyph(char charcode)const {
        ASSERT_M(containsGlyph(charcode), "Sized font does not contain desired glyph.");
        return *glyphs_[charcode];
    }

    inline Glyph& SizedFont::addGlyph(char charcode, const ARect& region, int offset_x, int offset_y, f32 advance_x) {
        if ((u8)charcode >= glyphs_.size())
            glyphs_.resize(size_t(charcode)+1, NULL);
        glyphs_[charcode] = new Glyph(charcode, region, offset_x, offset_y, advance_x);
        return *glyphs_[charcode];
    }


    inline Font::Font(const std::string& fontname)
     : fontname_(fontname)
    {}

    inline Font::~Font() {
        for (size_t i=0; i<sizes_.size(); ++i) {
            if (sizes_[i]) {
                delete sizes_[i];
            }
        }
    }

    inline bool Font::containsSizedFont(u32 font_size)const {
        if (font_size>=sizes_.size())
            return false;
        return sizes_[font_size] != NULL;
    }

    inline SizedFont& Font::getSizedFont(u32 font_size) {
        ASSERT_M(containsSizedFont(font_size), "Font size is not contained for " +fontname_);
        return *sizes_[font_size];
    }

    inline const SizedFont& Font::getSizedFont(u32 font_size)const {
        ASSERT_M(containsSizedFont(font_size), "Font size is not contained for " +fontname_);
        return *sizes_[font_size];
    }

    inline fast_vector<u32> Font::getSizes()const {
        fast_vector<u32> sizes_out;
        for (size_t i=0; i<sizes_.size(); ++i) {
            if (sizes_[i])
                sizes_out.push_back(i);
        }
        return sizes_out;
    }

    inline SizedFont& Font::addSize(size_t s) {
        if (s >= sizes_.size())
            sizes_.resize(s+1, NULL);

        sizes_[s] = new SizedFont();
        return *sizes_[s];
    }

    inline void Font::setFontname(const std::string& fontname) {
        fontname_ = fontname;
    }

    inline const std::string& Font::getFontname()const {
        return fontname_;
    }

}