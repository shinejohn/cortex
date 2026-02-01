import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image as ImageIcon,
  Table,
  Code,
  Quote,
  Minus,
  ChevronDown,
  Type,
  Palette,
  ChevronRight } from
'lucide-react';
export const EditorToolbar = ({ onFormatClick, isPreview }) => {
  const [showExtendedTools, setShowExtendedTools] = useState(false);
  if (isPreview) return null;
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[52px] z-10">
      <div className="max-w-full mx-auto px-4 py-1">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text formatting */}
          <div className="flex items-center space-x-1 mr-3">
            <button
              onClick={() => onFormatClick('bold')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Bold (Ctrl+B)">

              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('italic')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Italic (Ctrl+I)">

              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('underline')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Underline (Ctrl+U)">

              <Underline className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('strikethrough')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Strikethrough">

              <Strikethrough className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          {/* Separator */}
          <div className="h-6 border-l border-gray-300 mx-1"></div>
          {/* Headers */}
          <div className="flex items-center space-x-1 mr-3">
            <button
              onClick={() => onFormatClick('h1')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Heading 1">

              <div className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('h2')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Heading 2">

              <div className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('h3')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Heading 3">

              <div className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('h4')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors hidden sm:block"
              title="Heading 4">

              <div className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          {/* Separator */}
          <div className="h-6 border-l border-gray-300 mx-1"></div>
          {/* Lists */}
          <div className="flex items-center space-x-1 mr-3">
            <button
              onClick={() => onFormatClick('bulletList')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Bullet List">

              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('numberedList')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Numbered List">

              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('checkList')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Check List">

              <CheckSquare className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          {/* Separator */}
          <div className="h-6 border-l border-gray-300 mx-1"></div>
          {/* Alignment */}
          <div className="flex items-center space-x-1 mr-3 hidden sm:flex">
            <button
              onClick={() => onFormatClick('alignLeft')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Align Left">

              <AlignLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('alignCenter')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Align Center">

              <AlignCenter className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('alignRight')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Align Right">

              <AlignRight className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('alignJustify')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Justify">

              <AlignJustify className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          {/* Separator */}
          <div className="h-6 border-l border-gray-300 mx-1 hidden sm:block"></div>
          {/* Insert */}
          <div className="flex items-center space-x-1 mr-3">
            <button
              onClick={() => onFormatClick('link')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Insert Link (Ctrl+K)">

              <Link className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('image')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Insert Image">

              <ImageIcon className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('table')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors hidden sm:block"
              title="Insert Table">

              <Table className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('code')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors hidden sm:block"
              title="Code Block">

              <Code className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('quote')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Block Quote">

              <Quote className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => onFormatClick('divider')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors hidden sm:block"
              title="Horizontal Divider">

              <Minus className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          {/* More tools toggle */}
          <div className="ml-auto">
            <button
              onClick={() => setShowExtendedTools(!showExtendedTools)}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center"
              title="More Formatting Options">

              <span className="text-xs text-gray-600 mr-1">More</span>
              {showExtendedTools ?
              <ChevronDown className="h-4 w-4 text-gray-600" /> :

              <ChevronRight className="h-4 w-4 text-gray-600" />
              }
            </button>
          </div>
        </div>
        {/* Extended tools */}
        {showExtendedTools &&
        <div className="border-t border-gray-200 pt-2 pb-1 mt-1 flex flex-wrap items-center gap-4">
            {/* Font options */}
            <div className="flex items-center">
              <Type className="h-4 w-4 text-gray-600 mr-2" />
              <select className="text-sm border border-gray-300 rounded p-1">
                <option>Default Font</option>
                <option>Serif</option>
                <option>Sans Serif</option>
                <option>Monospace</option>
              </select>
              <select className="text-sm border border-gray-300 rounded p-1 ml-2">
                <option>Normal</option>
                <option>Small</option>
                <option>Large</option>
                <option>X-Large</option>
              </select>
            </div>
            {/* Color options */}
            <div className="flex items-center">
              <Palette className="h-4 w-4 text-gray-600 mr-2" />
              <button className="w-6 h-6 rounded-full bg-black border border-gray-300 mr-1"></button>
              <button className="w-6 h-6 rounded-full bg-red-600 border border-gray-300 mr-1"></button>
              <button className="w-6 h-6 rounded-full bg-blue-600 border border-gray-300 mr-1"></button>
              <button className="w-6 h-6 rounded-full bg-green-600 border border-gray-300 mr-1"></button>
              <button className="w-6 h-6 rounded-full bg-yellow-500 border border-gray-300 mr-1"></button>
              <button className="w-6 h-6 rounded-full bg-gray-400 border border-gray-300 mr-1"></button>
            </div>
            {/* Spacing options */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Spacing:</span>
              <select className="text-sm border border-gray-300 rounded p-1">
                <option>Normal</option>
                <option>Compact</option>
                <option>Relaxed</option>
                <option>Double</option>
              </select>
            </div>
            {/* Special formats */}
            <div className="flex items-center space-x-2">
              <button className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100">
                Footnote
              </button>
              <button className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100">
                Citation
              </button>
              <button className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100">
                Embed Media
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

};