import React, { useState } from 'react';
import { X } from 'lucide-react';
interface EditJournalistModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalist?: {
    name: string;
    slug?: string;
    avatar: string;
    description?: string;
    biography?: string;
    mainGenre?: string;
    alternativeGenres?: string[];
    categories?: string[];
    perspectives?: string[];
    styles?: string[];
    primaryTone?: string;
    secondaryTones?: string[];
  };
  onSave: (journalist: any) => void;
}
export const EditJournalistModal: React.FC<EditJournalistModalProps> = ({
  isOpen,
  onClose,
  journalist,
  onSave
}) => {
  const [formData, setFormData] = useState(
    journalist || {
      name: '',
      slug: '',
      avatar: "/image.png",

      description: '',
      biography: '',
      mainGenre: 'The News Report',
      alternativeGenres: ['The News Chronicle'],
      categories: ['Economy / Business News', 'Community'],
      perspectives: [
      'Investigative Journalism',
      'Feature Story (Human-Interest Focused)',
      'Analytical Journalism',
      'Community-Based Reporting'],

      styles: ['attention', 'clarity', 'informative rigor'],
      primaryTone: 'neutral',
      secondaryTones: ['serious', 'reflective']
    }
  );
  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCheckboxChange = (category: string, field: string) => {
    setFormData((prev) => {
      const currentCategories = prev[field] || [];
      if (currentCategories.includes(category)) {
        return {
          ...prev,
          [field]: currentCategories.filter((c) => c !== category)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentCategories, category]
        };
      }
    });
  };
  const handleSave = () => {
    onSave(formData);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Virtual Journalist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">

            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
              <img
                src={formData.avatar}
                alt="Journalist avatar"
                className="w-full h-full object-cover" />

            </div>
            <button className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded">
              Regenerate Avatar with AI
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

                  </div>
                  <div>
                    <label className="block text-sm mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />

                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Avatar Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="A young Asian-American male with short black hair, wearing rectangular glasses and a casual button-up shirt, exuding a friendly and approachable demeanor." />

                  </div>
                </div>
              </div>
              {/* Biography */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Biography</h3>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={10}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Jordan Lee is a dedicated journalist with a passion for uncovering the stories that shape and influence the community. Born and raised in the bustling city, he has always been fascinated by the dynamic interplay between local events and broader societal trends..." />

              </div>
            </div>
            <div>
              {/* Personality */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Personality</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm">Main Genre</label>
                      <span className="text-sm text-gray-500">Enriching</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="mainGenre"
                        value={formData.mainGenre}
                        onChange={handleChange}
                        className="flex-grow border border-gray-300 rounded-l px-3 py-2 text-sm" />

                      <div className="border border-l-0 border-gray-300 rounded-r px-3 py-2 text-sm bg-gray-50 text-gray-500">
                        lively
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Alternative Genres
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={formData.alternativeGenres.includes(
                            'The News Chronicle'
                          )}
                          onChange={() =>
                          handleCheckboxChange(
                            'The News Chronicle',
                            'alternativeGenres'
                          )
                          } />

                        <span>The News Chronicle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Specialties & Perspectives */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">
                  Specialties & Perspectives
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                      'Economy / Business News',
                      'Community',
                      'Politics',
                      'Sports',
                      'Education'].
                      map((category) =>
                      <div
                        key={category}
                        className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">

                          <input
                          type="checkbox"
                          className="mr-1"
                          checked={formData.categories.includes(category)}
                          onChange={() =>
                          handleCheckboxChange(category, 'categories')
                          } />

                          <span>{category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Journalistic Perspectives
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                      'Investigative Journalism',
                      'Feature Story (Human-Interest Focused)',
                      'Analytical Journalism',
                      'Community-Based Reporting'].
                      map((perspective) =>
                      <div
                        key={perspective}
                        className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">

                          <input
                          type="checkbox"
                          className="mr-1"
                          checked={formData.perspectives.includes(
                            perspective
                          )}
                          onChange={() =>
                          handleCheckboxChange(perspective, 'perspectives')
                          } />

                          <span>{perspective}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Writing Style */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Writing Style</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">
                      Journalistic Styles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                      'attention',
                      'clarity',
                      'informative rigor',
                      'conversational',
                      'narrative'].
                      map((style) =>
                      <div
                        key={style}
                        className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">

                          <input
                          type="checkbox"
                          className="mr-1"
                          checked={formData.styles.includes(style)}
                          onChange={() =>
                          handleCheckboxChange(style, 'styles')
                          } />

                          <span>{style}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm">Primary Tone</label>
                      <span className="text-sm text-gray-500">
                        Secondary Tones
                      </span>
                    </div>
                    <div className="flex items-center">
                      <select
                        name="primaryTone"
                        value={formData.primaryTone}
                        onChange={handleChange}
                        className="flex-grow border border-gray-300 rounded-l px-3 py-2 text-sm">

                        <option value="neutral">neutral</option>
                        <option value="formal">formal</option>
                        <option value="casual">casual</option>
                      </select>
                      <div className="flex border border-l-0 border-gray-300 rounded-r px-3 py-2 text-sm bg-gray-50">
                        {[
                        'serious',
                        'reflective',
                        'optimistic',
                        'critical'].
                        map((tone) =>
                        <div
                          key={tone}
                          className="inline-flex items-center mr-2">

                            <input
                            type="checkbox"
                            className="mr-1"
                            checked={formData.secondaryTones.includes(tone)}
                            onChange={() =>
                            handleCheckboxChange(tone, 'secondaryTones')
                            } />

                            <span className="text-xs">{tone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium">

              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium">

              Save
            </button>
          </div>
        </div>
      </div>
    </div>);

};