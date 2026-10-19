import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight, ChevronDown, Sparkles, Search } from 'lucide-react';
import './CategoriesPage.css';

interface CategoryDetail {
  id: string;
  name: string;
  number: string;
  tagline: string;
  description: string;
  image: string;
  tags: string[];
  idealFor: string;
}

const CATEGORIES_LIST: CategoryDetail[] = [
  {
    id: 'bridal',
    name: 'Bridal',
    number: '01',
    tagline: 'For your forever moment',
    description: 'Flawless HD & airbrush finishes, luminous skin-prep, and heirloom traditions crafted to stay tear-proof and radiant from rituals to reception.',
    image: '/images/categories/bridal.jpg',
    tags: ['HD Airbrush', 'Long-lasting', 'Waterproof', 'Cultural Draping', 'Bridal Dupatta Setting'],
    idealFor: 'Weddings, Engagements, Receptions, Sangeet & Haldi',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    number: '02',
    tagline: 'A little unexpected. All you.',
    description: 'High-fashion precision, bold experimentation, and graphic symmetry created specifically for studio lighting, editorial spreads, and camera lenses.',
    image: '/images/categories/editorial.jpg',
    tags: ['Graphic Liner', 'High Fashion', 'Studio Lighting Ready', 'Concept Looks', 'Avant-Garde'],
    idealFor: 'Photoshoots, Fashion Shows, Lookbooks, Campaigns & Portfolios',
  },
  {
    id: 'glamour',
    name: 'Glamour',
    number: '03',
    tagline: 'Make an entrance',
    description: 'Sculpted cheekbones, dramatic cut creases, velvet lips, and luminous highlights engineered to command the room and catch evening lights.',
    image: '/images/categories/glamour.jpg',
    tags: ['Full Glam', 'Cut Crease', 'Contour & Highlight', 'Velvet Lips', 'Lash Drama'],
    idealFor: 'Cocktails, Galas, Red Carpet, Award Nights & Black Tie Events',
  },
  {
    id: 'natural',
    name: 'Natural',
    number: '04',
    tagline: 'Beautifully, effortlessly you',
    description: 'Skin-first enhancement, featherlight serum foundations, and barely-there elevation that leaves skin breathable, dewy, and authentic.',
    image: '/images/categories/natural.jpg',
    tags: ['No-Makeup Makeup', 'Glass Skin', 'Feathered Brows', 'Hydrating Finishes', 'Soft Glow'],
    idealFor: 'Daytime Events, Corporate Headshots, Intimate Brunches & Casual Shoots',
  },
  {
    id: 'party',
    name: 'Party',
    number: '05',
    tagline: 'Vibrant, bold, ready to celebrate',
    description: 'Playful color pops, micro-glitter accents, and sweat-resistant formulations designed to keep your glow vibrant and crease-free all night long.',
    image: '/images/categories/party.jpg',
    tags: ['Party Glow', 'Sweat-Resistant', 'Glitter Accent', 'Pop Color', 'Trend Focused'],
    idealFor: 'Birthdays, Club Events, Bachelorettes, Afterparties & Concerts',
  },
  {
    id: 'festive',
    name: 'Festive',
    number: '06',
    tagline: 'Tradition woven with modern elegance',
    description: 'Rich warm golds, regal jewel tones, and celebratory artistry honoring sacred festivities with timeless grace and contemporary balance.',
    image: '/images/categories/festive.jpg',
    tags: ['Royal Gold Hues', 'Kohl Accents', 'Festive Glow', 'Bindi Styling', 'Traditional Finesse'],
    idealFor: 'Diwali, Eid, Puja, Family Celebrations & Cultural Festivities',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    number: '07',
    tagline: 'Dreamlike, ethereal, otherworldly',
    description: 'Celestial textures, face embellishments, crystal artistry, and fairytale aesthetics born from pure imagination and artistic storytelling.',
    image: '/images/categories/fantasy.jpg',
    tags: ['Ethereal Shimmer', 'Face Crystals', 'Custom Motifs', 'Mythical Aesthetic', 'Creative Art'],
    idealFor: 'Theme Galas, Festival Arts, Creative Concepts & Editorial Projects',
  },
  {
    id: 'sfx',
    name: 'SFX',
    number: '08',
    tagline: 'Transformative, cinematic character artistry',
    description: 'Prosthetic applications, hyper-realistic illusion, theatrical aging, and special effects sculpted using professional film and television standards.',
    image: '/images/categories/sfx.jpg',
    tags: ['Prosthetics', 'Theatrical Illusion', 'Character Design', 'Airbrush Detailing', 'Film Ready'],
    idealFor: 'Film & Theatre, Halloween, Themed Productions & Creative Cosplay',
  },
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isHeroInfoOpen, setIsHeroInfoOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    return CATEGORIES_LIST.filter(category => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === 'All' ||
        category.name.toLowerCase() === selectedTag.toLowerCase() ||
        category.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  return (
    <div className="categories-page">
      {/* ── Hero ── */}
      <section className={`categories-hero ${isHeroInfoOpen ? 'is-info-open' : ''}`}>
        <div className="categories-hero__inner">
          <div className="categories-hero__top-bar">
            <nav className="categories-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <span>All Styles</span>
            </nav>

            <button
              type="button"
              className={`categories-hero__mobile-toggle ${isHeroInfoOpen ? 'is-active' : ''}`}
              onClick={() => setIsHeroInfoOpen(!isHeroInfoOpen)}
              aria-expanded={isHeroInfoOpen}
              aria-label={isHeroInfoOpen ? 'Hide style guide details' : 'Show style guide details'}
            >
              <Sparkles size={12} />
              <span>{isHeroInfoOpen ? 'Hide info' : 'About styles'}</span>
              <ChevronDown size={14} className="categories-hero__toggle-chevron" />
            </button>
          </div>

          <div className="categories-hero__header-row">
            <h1 className="categories-hero__title">
              All Styles & Looks. <em className="categories-hero__title-em">An Occasion. A Feeling.</em>
            </h1>
          </div>

          <div className={`categories-hero__dropdown ${isHeroInfoOpen ? 'is-open' : ''}`}>
            <span className="categories-hero__eyebrow">
              <Sparkles size={15} /> Lume Artistry · 08 Curated Styles
            </span>
            <p className="categories-hero__desc">
              Explore every signature beauty aesthetic curated across the Lume network. From understated,
              radiant natural enhancement to high-fashion editorial and cinematic transformation, find the
              exact specialty that mirrors your vision.
            </p>
          </div>
        </div>
      </section>

      {/* ── Controls & Quick Filter ── */}
      <section className="categories-controls" aria-label="Style search and filter">
        <div className="categories-search-bar">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search styles (e.g. Bridal, Editorial, Glow, Natural)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search makeup styles and categories"
          />
        </div>

        <div className="categories-chips">
          <button
            type="button"
            className={`categories-chip ${selectedTag === 'All' ? 'is-active' : ''}`}
            onClick={() => setSelectedTag('All')}
          >
            All Styles ({CATEGORIES_LIST.length})
          </button>
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`categories-chip ${selectedTag === cat.name ? 'is-active' : ''}`}
              onClick={() => setSelectedTag(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Categories Grid ── */}
      <section className="categories-container" aria-label="Curated Categories Gallery">
        <div className="categories-grid">
          {filteredCategories.map(category => (
            <article className="category-card" key={category.id}>
              <Link
                to={`/discover?category=${category.name}`}
                className="category-card__image-wrap"
                aria-label={`Explore artists specializing in ${category.name}`}
              >
                <img src={category.image} alt={`${category.name} makeup style inspiration`} loading="lazy" />
                <span className="category-card__number">{category.number}</span>
                <span className="category-card__quick-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </Link>

              <div className="category-card__body">
                <div className="category-card__header">
                  <h2 className="category-card__title">
                    <Link to={`/discover?category=${category.name}`}>{category.name}</Link>
                  </h2>
                  <span className="category-card__tagline">{category.tagline}</span>
                </div>

                <p className="category-card__description">{category.description}</p>

                <div className="category-card__tags">
                  {category.tags.slice(0, 3).map(tag => (
                    <span className="category-card__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <Link to={`/discover?category=${category.name}`} className="category-card__action">
                  <span>Explore {category.name} Artists</span>
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Bottom Banner ── */}
      <section className="categories-banner" aria-labelledby="banner-heading">
        <div>
          <h2 id="banner-heading">
            Looking for a <em>custom combination</em> of styles?
          </h2>
          <p>
            Many of our artists specialize in hybrid looks—from soft bridal-glamour to camera-ready
            natural tones. Browse through our complete artist directory or filter directly by your city and occasion.
          </p>
        </div>
        <div className="categories-banner__actions">
          <Link to="/discover" className="categories-banner__button-primary">
            Explore All Artists <ArrowUpRight size={18} />
          </Link>
          <Link to="/" className="categories-banner__button-secondary">
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
