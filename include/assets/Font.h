#ifndef FONT_H
#define FONT_H

#include "TexturePacker.h"
#include "types/containers/fast_vector.h"
#include "maths/shapes/ARect.h"

/*
 * Inspired by Freetype-gl library
 *
 * TODO:
 *      outlines
 *      LCD filtering
 * /


 * Glyph metrics:
 * --------------
 *
 *                       xmin                     xmax
 *                        |                         |
 *                        |<-------- width -------->|
 *                        |                         |
 *              |         +-------------------------+----------------- ymax
 *              |         |    ggggggggg   ggggg    |     ^        ^
 *              |         |   g:::::::::ggg::::g    |     |        |
 *              |         |  g:::::::::::::::::g    |     |        |
 *              |         | g::::::ggggg::::::gg    |     |        |
 *              |         | g:::::g     g:::::g     |     |        |
 *    offset_x -|-------->| g:::::g     g:::::g     |  offset_y    |
 *              |         | g:::::g     g:::::g     |     |        |
 *              |         | g::::::g    g:::::g     |     |        |
 *              |         | g:::::::ggggg:::::g     |     |        |
 *              |         |  g::::::::::::::::g     |     |      height
 *              |         |   gg::::::::::::::g     |     |        |
 *  baseline ---*---------|---- gggggggg::::::g-----*--------      |
 *            / |         |             g:::::g     |              |
 *     origin   |         | gggggg      g:::::g     |              |
 *              |         | g:::::gg   gg:::::g     |              |
 *              |         |  g::::::ggg:::::::g     |              |
 *              |         |   gg:::::::::::::g      |              |
 *              |         |     ggg::::::ggg        |              |
 *              |         |         gggggg          |              v
 *              |         +-------------------------+----------------- ymin
 *              |                                   |
 *              |------------- advance_x ---------->|
 */


namespace grynca {

    // specific offset for some glyph-pairs
    struct Kerning {
        char charcode;
        f32 value;
    };

    class Glyph {
    public:

        char getCharcode()const;
        TextureRegion& getRegion();
        const TextureRegion& getRegion()const;
        int getOffsetX()const;
        int getOffsetY()const;
        f32 getAdvanceX()const;
        f32 getKerning(char charcode)const;
        void addKerning(const Kerning& kerning);
    private:
        friend class SizedFont;

        Glyph();
        Glyph(char charcode, const ARect& region, int offset_x, int offset_y, f32 advance_x);

        char charcode_;
        TextureRegion region_;
        int offset_x_, offset_y_;
        f32 advance_x_;        // in fractional pixels

        fast_vector<Kerning> kernings_;
    };

    class SizedFont {
    public:
        ~SizedFont();

        bool containsGlyph(char charcode)const;

        ustring getCharcodes()const;     // gets charcodes for which glyphs are contained
        Glyph& getGlyph(char charcode);
        const Glyph& getGlyph(char charcode)const;
        Glyph& addGlyph(char charcode, const ARect& region,
                        int offset_x, int offset_y, f32 advance_x);
    private:
        friend class Font;

        SizedFont() {}

        fast_vector<Glyph*> glyphs_;        // indexed with charcode
    };

    class Font {
    public:
        Font(const ustring& fontname = "");
        ~Font();

        bool containsSizedFont(u32 font_size)const;
        SizedFont& getSizedFont(u32 font_size);
        const SizedFont& getSizedFont(u32 font_size)const;
        fast_vector<u32> getSizes()const;
        SizedFont& addSize(size_t s);

        void setFontname(const ustring& fontname);
        const ustring& getFontname()const;
    private:
        ustring fontname_;
        fast_vector<SizedFont*> sizes_;      // indexed with size
    };

}

#include "Font.inl"
#endif //FONT_H
