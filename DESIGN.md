# Santi's Watches - UI / UX Design System

## 1. Brand Aesthetic (North Star)
"Santi's Watches" is a premium online marketplace for high-end, luxury watch reselling. 
The interface must project **Security**, **Trust**, **Exclusivity**, and a **Flawless Shopping Experience**.

"Santi's Watches" must feel like a private luxury watch gallery, not a generic ecommerce shop.

The experience should resemble browsing watches in:
- a high-end boutique
- a private dealer catalogue

Key feelings:
- Discreet luxury
- Confidence
- Collector culture
- Precision engineering

Avoid anything that feels:
- flashy
- cheap
- overly animated
- loud

Luxury UI rule: Luxury feels quiet, confident, and spacious.

- **Theme:** Dark Mode by default. Represents luxury and highlights the details of metallic/gold materials.
- **Vibe:** Minimalist, cinematic, professional, clean geometry. No aggressive colors. Luxurious, clean...

## 2. Color Palette
- **Background (Blackmode default):** #0D0D0D
- **Surface / Cards (Darkmode default add for white mode):** #262626
- **Accents (Primary):** 
  - **Blue:** #5A7E8C
  - **Silver/Steel:** #686868ff 
- **Text:** 
  - **Primary:** #8FB6BF
  - **Muted/Secondary:** #455359 
- **Borders:** #F2F2F2

## 3. Typography
- **Headings (Brand/Display):** `Playfair Display` or `Cinzel` (or a high-end serif equivalent). Used for watch names, big promos, and hero titles.
- **Body & UI Elements:** `Inter` used for prices, specs, buttons, and navigation. 
- **Tracking/Spacing:** Generous letter-spacing (uppercase tracking) on small labels. Clean line-height for body.

## 4. Layout & Interactions
- **Cards (Watches):** Large, high-resolution imagery. Use `aspect-square` or `aspect-[4/5]` for product photos. On hover, the image scales slightly (zoom-in effect) `scale-105 transition-transform duration-500`.
- **Bento Grid:** Use modern Bento-box layouts for the grid of watches and recommendations.
- **Micro-interactions:** Smooth fade-ins (`framer-motion`), soft glows on hover over luxury pieces, skeleton loaders for fetching items.
- **Feedback:** Success toasts and notifications to confirm authentication and cart additions.

## 5. UI Components Catalog (shadcn/ui + Tailwind)
Below is the definitive list of technical components that will construct the interface. We reuse these primitives to ensure maximum consistency:

### Navigation & Menus
- `NavigationMenu`: Header hierarchy (Brands, Materials, Promos).
- `Sheet` / `DropdownMenu`: Mobile responsiveness and user profile options.
- `Avatar`: Displaying the logged-in user's profile or Google Picture.

### Product Discovery (Search & Filters)
- `Input` + `Command` (`cmdk`): Global search bar for watch names/reference numbers.
- `Select` / `RadioGroup` / `Checkbox`: Filtering options for Brands (Rolex, AP, Patek), Materials (Rose Gold, Stainless Steel), and Sorting (Price Low/High).
- `Slider`: Filtering by maximum/minimum price bounds.
- `ScrollArea`: Handling long lists of tags or materials inside the filter sidebar.

### Presentation (Watch Display)
- `Card`: The foundational block for displaying individual watches.
- `AspectRatio`: Ensuring perfectly aligned watch images regardless of upload size.
- `HoverCard` / `Tooltip`: Showing quick specs on hover over a watch card or material icon.
- `Carousel` (`embla-carousel-react`): Displaying multiple images/videos for a single watch inside the Product Detail Page.
- `Badge`: Used for tags like "New", "Promo", "Sold Out" or specific watch materials.

### Authentication & Checkout
- `Dialog` / `AlertDialog`: Secure popups for login via Email or Google, and email verification notices.
- `Button`: Primary calls to actions. The "Buy Now" button must be the most visually striking element on the product page.
- `Form` (`react-hook-form` + `zod`): Highly validated input for shipping info and login credentials.
- `Toast` (`sonner` / `react-hot-toast`): Confirmation of successful checkout or login. 

## 6. Development Rules
1. **Never use raw colors:** Always use Tailwind utility variables mapped to `globals.css`.
2. **Reusability:** If a piece of UI is used twice, extract it into a React component under `components/ui` or `components/custom`.
3. **No Placeholders:** If an image is missing, we use a sleek, animated skeleton (`Skeleton` component). We use R2 images primarily.
4. **Consistency:** All interactive elements must have the `cursor-pointer` class and a defined hover state that provides feedback to the user without layout jumps.
