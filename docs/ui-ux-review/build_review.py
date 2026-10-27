"""Build the self-contained LUME review. Only writes files in this report folder."""
from pathlib import Path
from html import escape
from collections import Counter
import json

ROOT = Path(__file__).resolve().parent
items = []
def add(id, area, priority, effort, title, observed, change, acceptance, evidence, dependency="Frontend"):
    items.append(dict(id=id, area=area, priority=priority, effort=effort, title=title,
                      observed=observed, change=change, acceptance=acceptance,
                      evidence=evidence, dependency=dependency))

add('G01','Brand & navigation','P1','M','Keep the identity; simplify the visual system',
    'Live screens combine blush gradients, pill controls, shadows, sparkles, large serif introductions and several badge styles.',
    'Keep the LUME identity, warm neutrals and editorial serif headings. Use deep plum for primary actions, dusty rose for accents, quiet dividers and fewer shadows. Standardize buttons, fields, badges, spacing and card shapes.',
    'A shared component sheet covers default, hover, focus, selected, loading, disabled and error states.', 'Live public screens; styles/index.css; HomeEditorial.css')
add('G02','Brand & navigation','P1','S','Make navigation describe the task',
    'The navigation uses Artists and Categories; joining as an artist is mainly a footer action.',
    'Use Find an artist, Looks & occasions, How it works, Saved and Account. Keep About in the secondary navigation. Give For artists a clear secondary entry without competing with customer search.',
    'A first-time visitor can identify the customer journey and artist entry without opening several pages.', 'Live Header and Footer; components/layout/Header.tsx')
add('G03','Brand & navigation','P1','M','Use one search vocabulary everywhere',
    'Home, header search and Discover use related but different controls. Occasion choices include both events and aesthetics.',
    'Share occasion, location and optional date across entry points. Retain selections in the results URL and show editable chips. Keep one location autocomplete and one spelling for each city.',
    'Home search, header search, refresh, back and shared URLs reproduce the same criteria.', 'LandingPage.tsx; DiscoverPage.tsx; Header.tsx', 'Frontend + search API')
add('G04','Brand & navigation','P2','S','Return the standard pointer and native scrolling',
    'A custom dot/ring cursor runs globally; inertial scrolling is initialized across routes.',
    'Use the native pointer and scrolling by default, especially in search, forms and dashboards. Keep restrained hover transitions. If retained, restrict decorative motion to optional marketing experiences.',
    'Text selection, wheel scrolling, keyboard navigation and nested dialogs behave predictably.', 'components/ui/CustomCursor.tsx; components/layout/SmoothScroll.tsx')
add('G05','Brand & navigation','P1','S','Remove the artificial entry delay',
    'The preloader fades after 1.2 seconds and is removed at 1.8 seconds on a new session.',
    'Render usable content immediately. Reserve skeletons for real data loading; a logo transition should never block search.',
    'Search is usable as soon as its controls mount, regardless of image or artist API readiness.', 'components/ui/Preloader.tsx')
add('G06','Brand & navigation','P1','M','Provide visible help and policy routes',
    'The current footer provides contact email but no visible privacy, terms, cancellation or refund links. Artist pages advertise support and free rescheduling.',
    'Add readable Help, cancellation/refund, terms and privacy destinations. State actual support channels, hours and response expectations. Publish only operationally supported promises.',
    'Policies are reachable before requesting and paying; support contact wording agrees across screens.', 'Live Footer; ArtistDetailPage.tsx TRUST_ITEMS; ProfilePage.tsx FAQS', 'Content + operations + frontend')

add('H01','Homepage','P1','M','Turn the hero headline into real text',
    'The visible hero message is part of the slideshow artwork. The inspected home accessibility tree has no main heading; LandingPage renders images without a live h1.',
    'Use a real h1: Find your makeup artist. Add: For your occasion, your city, your style. Keep photographs free of baked-in text, with responsive crops and sufficient text contrast.',
    'The proposition remains readable with images disabled, at 200% zoom and through a screen reader.', 'Live homepage; LandingPage.tsx hero picture elements')
add('H02','Homepage','P1','M','Make the first viewport work harder',
    'The homepage is dominated by a full-height campaign image; search sits near the bottom of the screen.',
    'Use a shorter split hero with the search immediately beside or below the headline. On mobile, place the proposition and search before the supporting image. Reveal the next section without a large empty gap.',
    'At 390 × 844, occasion, location and Find artists are visible without scrolling; desktop hints at artist content below.', 'Live homepage screenshot; HomeEditorial.css')
add('H03','Homepage','P1','M','Prioritize evidence before brand storytelling',
    'The page contains artist cards, an about slideshow, occasions, video process cards, FAQs and a moodboard.',
    'Use this order: proposition/search → common occasions → relevant artists → three-step request process → real proof → concise FAQ → artist recruitment/footer. Put the longer story on About.',
    'Every homepage section answers a distinct booking question and has one meaningful next step.', 'Live home section sequence; LandingPage.tsx')
add('H04','Homepage','P2','S','Replace automatic slides with a calm first impression',
    'The hero rotates every 5 seconds and the About imagery every 4.5 seconds. Process videos rely on hover previews.',
    'Prefer one strong hero. If rotation stays, provide pause and navigation controls, stop for reduced motion and avoid changing important copy. Give videos explicit play controls, posters and useful static text.',
    'Touch and keyboard users can access the same meaning; no essential instruction requires hover.', 'LandingPage.tsx timers and ProcessStepCard', 'Frontend + media selection')
add('H05','Homepage','P2','S','Make inspiration links preserve intent',
    'The moodboard has distinct labels such as The bridal edit and Soft-glam moments, but all inspected links point to the unfiltered directory.',
    'Route each edit to matching criteria or a curated collection. Use actual artist work with permission and credit, then connect each look to its artist and relevant service.',
    'A Bridal inspiration click opens bridal-relevant results instead of clearing the visitor’s context.', 'Live moodboard links; LandingPage.tsx home-moodboard', 'Frontend + portfolio metadata')

add('D01','Discovery & categories','P1','M','Bring results into the first screen',
    'At the reviewed desktop size, the directory introduction, search and large image circles fill almost the entire viewport before artist cards.',
    'Use a compact heading such as Makeup artists in Mumbai, then search, a small filter row and results. Keep brand storytelling on the homepage. Use a responsive grid with consistent image ratios.',
    'The first result card is visible in the initial desktop viewport; mobile shows a result soon after the search controls.', 'Live Discover screenshot; DiscoverPage.css')
add('D02','Discovery & categories','P1','M','Separate sort from filters',
    'The Filters dialog opens on Sort By and uses a two-pane hierarchy for sort, budget, location and experience.',
    'Expose Sort as a simple control next to the result count. Keep price, verification and experience in Filters with selected-state chips and Clear all. Use a single-column sheet on phones.',
    'Users can change sort directly and identify/remove each active filter without reopening multiple tabs.', 'Live Filters drawer; DiscoverPage.tsx')
add('D03','Discovery & categories','P1','L','Support event-first search with useful refinements',
    'The search currently mixes Bridal, Party and Festive with Natural, Glamour, Editorial, Fantasy and SFX.',
    'Separate Occasion from Look/style. Add studio versus at-venue, travel area, hair/draping inclusions, trials and date availability only where structured data supports them. Start with the refinements customers actually need.',
    'Bridal + Natural can coexist. Unsupported availability or travel filters are never presented as working.', 'Live categories; DiscoverPage.tsx DISCOVER_CATEGORIES', 'Taxonomy + artist onboarding + API')
add('D04','Discovery & categories','P0','M','Label starting prices with their service and unit',
    'The inspected artist card says From ₹3,000, while the profile defaults to Occasion ₹7,000; ₹3,000 is the hourly rate.',
    'Display Hourly from ₹3,000/hr or Bridal from ₹25,000 as appropriate. Match the card to the searched occasion. Keep the selected basis and tax/fee disclosure consistent through the summary.',
    'A card-to-profile transition never changes the apparent price without naming the different service or unit.', 'Live Kavita card and profile; DiscoverPage.tsx; ArtistDetailPage.tsx', 'Frontend + normalized pricing data')
add('D05','Discovery & categories','P1','M','Make cards comparable and truthful',
    'Live cards foreground a photo, Pro tag, several specialties, location and a generic starting price.',
    'Use actual portfolio work as the lead image with a separate artist avatar. Standardize name, city/service area, requested service price, verified status and rating + review count. Use New on LUME for unrated artists and explain any Pro label.',
    'Three cards can be compared on the same facts; no missing rating appears as a fabricated score.', 'Live result cards; ArtistCard.tsx; DiscoverPage.tsx', 'Frontend + media and listing data')
add('D06','Discovery & categories','P1','M','Give categories visual meaning',
    'Bridal uses a jewellery still life, Editorial uses coloured powders and Natural uses a vanity scene; these do not directly show the finished makeup result.',
    'Use recognizably different finished looks, consistent portrait crops and descriptive alt text. Reduce each category description to a useful sentence, typical inclusions and Explore artists. For eight options, prioritize browsing over a prominent search field.',
    'A person can visually distinguish Natural, Glamour and Bridal without reading a long paragraph.', 'Live Categories screenshot; CategoriesPage.tsx', 'Photography selection + content')
add('D07','Discovery & categories','P1','M','Preserve results and handle slow searches',
    'Discover fetches whenever the free-text query changes; the request shown in source has no cancellation or debouncing.',
    'Debounce text queries, cancel stale requests, retain previous results during refresh and announce the result count. Distinguish no match from server error; offer remove-a-filter, change-city and Retry actions.',
    'Fast typing cannot let an older response replace the newest query; failures retain criteria and allow recovery.', 'DiscoverPage.tsx fetch effect and filter state', 'Frontend + API response design')

add('A01','Artist profile','P1','M','Lead with work and the facts needed to choose',
    'The profile has a large identity/stats area with repeated verification and experience; Portfolio begins lower down.',
    'Show a compact identity row and strong portfolio gallery early. Include location, verification meaning, real review count and service starting price once. Keep section anchors for Portfolio, Services, About and Reviews.',
    'The first viewport shows both finished work and a clear path to reviewing services.', 'Live profile screenshot; ArtistDetailPage.tsx')
add('A02','Artist profile','P0','L','Explain unavailable dates instead of a dead end',
    'The inspected profile says Taking bookings, but all 30 displayed dates are disabled and labelled Full. Source also maps zero available slots to Full.',
    'Distinguish booked, day off, schedule not published, loading and availability unavailable. Offer Next available date, later-month browsing or other artists. Offer an availability enquiry only if the operational workflow exists.',
    'A missing/failed schedule is never labelled fully booked; every no-date state has an honest next step.', 'Live desktop/mobile profile; ArtistDetailPage.tsx upcomingDates and slotCountFor', 'Availability API + artist calendar + frontend')
add('A03','Artist profile','P1','L','Replace ambiguous occasion/service selection',
    'The booking card offers Wedding, Occasion and Hourly, then an optional service chip that combines several services into one long title.',
    'Present clear packages such as Bridal makeup + hair, Party makeup and Hourly session, each with duration, inclusions, exclusions and price basis. Keep add-ons separate and show how each selection changes the total.',
    'The selected service, duration and price in the summary match what the booking API will create.', 'Live profile booking card; ArtistDetailPage.tsx; artist/ArtistProfile.tsx', 'Service data model + API + artist editor')
add('A04','Artist profile','P1','M','Make time selection match appointment duration',
    'The source displays one-hour time buttons and allows multiple selections; readiness only checks for at least one selected slot.',
    'For a fixed package, ask for a start time and derive its duration/end time. For hourly work, explain minimum hours and require a valid contiguous block. Include travel/preparation buffers where supported.',
    'The interface cannot promise an appointment length that the schedule cannot accommodate.', 'ArtistDetailPage.tsx availableSlots, selectedTimeSlots and isBookingReady', 'Scheduling rules + backend validation')
add('A05','Artist profile','P1','M','Add decision-making portfolio and review context',
    'Portfolio photos can open in a lightbox and reviews show an aggregate. Existing basic structures are useful.',
    'Add look/service captions and occasion tags, accessible previous/next controls, optional video controls and keyboard support. For reviews, show service/date context and verified appointment status only when backed by data. Avoid retouching that hides actual finish.',
    'Visitors can identify work relevant to their occasion and understand the evidence behind a review badge.', 'Live profile portfolio/reviews; ArtistDetailPage.tsx', 'Frontend + media/review metadata')
add('A06','Artist profile','P1','S','State what verification and guarantees cover',
    'The profile shows Verified by Lume alongside Vetted Artists, 24/7 Support and Free Reschedule messages.',
    'Explain what was checked, separate identity/portfolio review from customer satisfaction, and link any protection or rescheduling promise to its actual conditions. Use one concise trust section.',
    'Every badge has an understandable definition; no unsupported response-time or refund promise appears.', 'Live profile; ArtistDetailPage.tsx TRUST_ITEMS', 'Operations-approved content')

add('B01','Booking & payment','P0','M','Name the request and confirmation stages accurately',
    'The main CTA says Reserve, the success modal says Booking Requested, and separate confirmation code maps every non-PENDING status to confirmed wording.',
    'Use Send booking request before acceptance. Show Request sent → Awaiting artist → Accepted, payment needed → Advance paid / Confirmed → Completed, with declined, expired and cancelled branches. Agree exactly when the date is secured.',
    'Every backend status maps explicitly to customer and artist language; accepted-but-unpaid is never labelled confirmed.', 'ArtistDetailPage.tsx; BookingConfirmPage.tsx; payments.controller.ts', 'Product policy + shared status mapping + backend')
add('B02','Booking & payment','P0','M','Resolve conflicting advance-payment promises',
    'Profile FAQ says 25% advance. PaymentOptionsModal and the payment controller calculate 50%. The FAQ also promises escrow and instant refunds.',
    'Choose the actual business rule and source the percentage, amounts and policy text centrally. Show service total, applicable taxes/fees, amount due now and balance due later before payment. Verify all escrow/refund claims with operations.',
    'FAQ, payment dialog, email, receipt and backend order agree for advance, full and remaining payments.', 'ProfilePage.tsx FAQS; PaymentOptionsModal.tsx; payments.controller.ts', 'Business rule + server quote + content')
add('B03','Booking & payment','P1','M','Provide a review step with clear edits',
    'The profile places occasion, optional service, date, time and optional details in one long booking surface.',
    'Group into Service → Date & time → Venue & contact → Review request. Keep a running summary on desktop and sticky next action on mobile. Make venue/contact requirements conditional on service mode, and preserve edits and validation errors.',
    'Before submission, the customer sees artist, service, duration, location, estimate and No payment now with an Edit action for each group.', 'ArtistDetailPage.tsx booking aside and mobile sheet', 'Frontend + required-field rules')
add('B04','Booking & payment','P1','L','Make payment recovery safe and understandable',
    'The payment modal has loading and error text, but verification failure asks the customer to contact support.',
    'Show processing, cancelled, failed, verification pending and successful outcomes separately. Reconcile the server payment state before inviting another payment. Keep the booking reference and a clear support route visible.',
    'A successful charge with a delayed verification is shown as pending verification, not a prompt to immediately pay again.', 'components/payment/PaymentOptionsModal.tsx', 'Payment reconciliation API + frontend')
add('B05','Booking & payment','P1','M','Give post-request screens an actionable next step',
    'BookingConfirmPage reads currentBooking from session storage and mainly offers Back to Home; the profile also has a separate request-success modal.',
    'Unify the receipt/status destination with View request, the next expected event and actual response guidance. Load bookings by an authorized reference so refresh or a new tab does not lose the status. Add calendar export only once the appointment is secured.',
    'Refreshing an authorized booking URL retains its truthful state and available next actions.', 'BookingConfirmPage.tsx; ArtistDetailPage.tsx success modal', 'Booking detail route/API + frontend')

add('S01','Saved artists','P1','M','Distinguish an empty shortlist from a loading failure',
    'SavedPage catches an API failure by assigning an empty array and fetches the first 100 artists before filtering saved IDs.',
    'Show Your shortlist is empty only for genuinely empty saved IDs. Show a recoverable error for failed loads and unavailable placeholders for removed artists. Fetch saved IDs directly so older artists do not disappear behind a list limit.',
    'Saved items survive a transient error and artists outside the first 100 results remain retrievable.', 'SavedPage.tsx fetch effect; hooks/useFavorites.ts', 'Saved-ID API + frontend')
add('S02','Saved artists','P2','L','Offer a small useful comparison',
    'The page promises review and compare but mainly displays saved artist cards.',
    'Allow comparing up to three artists on the same selected service, price basis, city/travel, review count, inclusions and availability when verified. Keep Compare optional until listing data is consistent.',
    'Comparison uses equivalent services and has a readable stacked layout on mobile.', 'SavedPage.tsx copy and cards', 'Structured services + availability data')
add('S03','Saved artists','P2','L','Explain where a shortlist is saved',
    'Favorites are stored in browser local storage rather than a connected account.',
    'Keep guest saving frictionless with a Saved confirmation and Undo for removal. Explain device-only storage until account synchronization exists; then merge guest saves on sign-in.',
    'The product never promises cross-device saving until it is implemented; removal is easy to undo.', 'hooks/useFavorites.ts; SavedPage.tsx', 'Frontend; account sync needs backend')

add('U01','Sign-in & registration','P1','M','Ask for fewer details before the first request',
    'Client registration displays name, email, phone, location, date of birth, gender and password in one form; optional fields are not clearly distinguished.',
    'Begin with the authentication details actually required. Collect contact and venue at booking; make DOB/gender optional profile enrichment only when there is a stated purpose. Separate the longer artist onboarding from basic account creation.',
    'A new customer can create an account without completing unrelated profile fields; optionality is explicit.', 'Live registration; auth/RegisterPage.tsx', 'Frontend + authentication validation policy')
add('U02','Sign-in & registration','P1','M','Return people to their booking after authentication',
    'Unauthenticated booking redirects to /login; a client login then navigates to /home, and booking selections live in component state.',
    'Retain the artist, service, date, time and non-sensitive draft choices; use a return destination after successful sign-in. Recheck availability before final submission and never auto-submit a restored request.',
    'Signing in midway returns to the same request review with any changed availability explained.', 'ArtistDetailPage.tsx handleBookingConfirm; auth/LoginPage.tsx', 'Frontend + draft lifetime rules')
add('U03','Sign-in & registration','P1','L','Provide account recovery and honest sign-in choices',
    'The inspected public sign-in screen has no Forgot password link. The source includes a conditional Google button which did not appear in the public screen reviewed.',
    'Add an accessible recovery flow and clear email delivery/retry states. Present Google sign-in only when configured and working. Route returning users using their account role rather than requiring them to guess a tab.',
    'A customer can recover access and return to the intended task; advertised sign-in methods are configured.', 'Live Login; auth/LoginPage.tsx; GoogleAuthButton.tsx', 'Recovery endpoints + auth provider configuration')
add('U04','Sign-in & registration','P1','S','Fix field labels and password controls',
    'Several auth inputs are exposed without names in the live accessibility tree; source labels lack htmlFor/id pairing and eye buttons lack descriptive names.',
    'Connect every label to its field, add suitable autocomplete/input modes and visible password requirements, name the show/hide action, and connect inline errors to their inputs.',
    'A screen reader announces each field, optional/required status and validation message; keyboard submission works.', 'Live auth accessibility trees; LoginPage.tsx; RegisterPage.tsx')

add('P01','Customer account','P1','M','Make appointments the account’s primary job',
    'ProfilePage combines bookings, saved artists, addresses, preferences, account settings and help.',
    'Lead with the next appointment and actions requiring attention. Separate Upcoming, Awaiting artist/payment and Past. Use compact booking cards with one primary action, a timeline and visible support access.',
    'A returning customer can find an accepted request needing payment without searching through settings.', 'ProfilePage.tsx; source review only')
add('P02','Customer account','P0','M','Remove invented personal defaults',
    'Source initializes a sample Mumbai address, sample phone number and preselected beauty preferences for an empty account.',
    'Start personal data empty. Use Add your venue and optional preference setup, with clear save feedback. Distinguish data saved on this device from account-backed information.',
    'A new account never appears to own a fictional address, phone number or skin preference.', 'ProfilePage.tsx DEFAULT_ADDRESSES and DEFAULT_PREFERENCES', 'Frontend; account persistence may need API')
add('P03','Customer account','P1','L','Make changes and cancellations trackable',
    'FAQ copy suggests coordinating rescheduling directly, but does not establish a single visible request/state contract.',
    'Show available changes, applicable conditions, outstanding balance and the status of any reschedule or cancellation request in booking details. Distinguish requested changes from accepted changes and refunds requested from completed.',
    'Both parties see the same agreed date and status; policy conditions are visible before confirming a change.', 'ProfilePage.tsx FAQS and booking UI; source review only', 'Operations rules + booking change APIs')
add('P04','Customer account','P1','M','Keep receipts, payments and support together',
    'Payment, invoice and help tools exist across the account, but booking and payment terminology is inconsistent.',
    'Use one booking-detail hub showing service total, paid amount, balance, payment events, receipt links and support reference. Keep optional beauty preferences lightweight and editable.',
    'Paid to date never looks like total service price; every payment action relates to a clear booking reference.', 'ProfilePage.tsx; BookingSummary.tsx; PaymentOptionsModal.tsx', 'Shared booking/payment data contract')

add('R01','Artist workspace','P1','M','Lead the dashboard with work requiring action',
    'ArtistDashboard includes an itinerary, statistics and workspace actions; authenticated visual behavior was not tested.',
    'Prioritize pending requests, today’s appointments, awaiting-payment bookings and profile/schedule setup. Include a preview of the public profile and explain unpublished or paused states.',
    'A new artist sees the next setup action; an active artist sees the next booking action first.', 'artist/ArtistDashboard.tsx; source review only')
add('R02','Artist workspace','P1','L','Make service and portfolio setup progressive',
    'ArtistProfile contains portrait, studio information, standard event rates, custom services and portfolio editing on a long page.',
    'Use grouped steps with draft saving, explicit required fields, image upload progress/crop/reorder, service inclusions and a public preview. Explain review pending, approved, changes requested and which edits are live.',
    'An interrupted upload or pending verification does not discard work or misrepresent what customers can see.', 'artist/ArtistProfile.tsx; source review only', 'Upload workflow + verification API + frontend')
add('R03','Artist workspace','P1','L','Make calendar setup prevent customer dead ends',
    'The calendar supports weekly templates and date exceptions. Its current-rate text uses a dollar sign in an otherwise INR product.',
    'Use INR throughout. Distinguish working hours, booked time, exceptions and unpublished schedules. Support copy-to-days, buffers and a customer-view preview. Warn before pausing/changing hours that affect existing bookings.',
    'Artists can tell which dates customers can actually request; changed availability does not silently invalidate appointments.', 'artist/ArtistCalendar.tsx; source review only', 'Scheduling API + dependency checks')
add('R04','Artist workspace','P0','M','Include advance-paid bookings in the artist’s work list',
    'ArtistBookings upcoming filter includes ACCEPTED and CONFIRMED but excludes PARTIALLY_PAID. The payment controller sets PARTIALLY_PAID after an advance.',
    'Use a shared booking-state map and include advance-paid appointments in the correct upcoming/payment groups. Display deposited amount and balance with clear labels; keep actions appropriate to each state.',
    'An advance-paid future appointment remains visible and actionable in the artist workspace.', 'artist/ArtistBookings.tsx upcomingBookings; payments.controller.ts ADVANCE update', 'Shared domain state mapping + frontend')
add('R05','Artist workspace','P0','M','Replace hardcoded performance claims with data',
    'ArtistRatings hardcodes 100% completion, Top tier reliability, Active search boost and Featured in Top Picks.',
    'Compute only supported metrics with clear definitions and periods. Show Not enough data for a new artist. Remove ranking/boost promises unless the system actually implements them.',
    'No performance or promotion badge appears without a corresponding real data source and rule.', 'artist/ArtistRatings.tsx; source review only', 'Analytics data + ranking policy')
add('R06','Artist workspace','P2','M','Use consistent action feedback and settings groups',
    'Booking failures can use browser alert, declines use window.confirm, and settings span studio policies, notifications and account details.',
    'Use contextual error/success feedback, a clear decline reason flow, and grouped settings with Save/Cancel and unsaved-change protection. Keep destructive account actions distinct and confirm their impact.',
    'Every operation communicates progress and outcome; changing tabs cannot silently lose edits.', 'artist/ArtistBookings.tsx; artist/ArtistSettings.tsx', 'Frontend + action audit/reason support')

add('X01','Admin workspace','P1','M','Prioritize operational queues',
    'AdminDashboard includes overview charts, artists, clients, payments and activity; no authenticated browser review was performed.',
    'Lead with pending verification, failed payouts and bookings needing intervention. Provide explicit queue counts, age, filters and an assigned next action; keep broader charts secondary.',
    'An operator can identify and open the oldest actionable item without interpreting several charts.', 'admin/AdminDashboard.tsx; source review only', 'Queue data + frontend')
add('X02','Admin workspace','P1','L','Make verification decisions explainable',
    'The admin modal supports profile details, verification/rejection, edit approval and booking overrides.',
    'Show submitted evidence beside public-preview content, differences between current and proposed data, rejection reasons and an action history. Keep payout/booking interventions visibly separate from routine profile editing.',
    'A decision records what changed and why; the artist receives actionable next steps from supported workflows.', 'admin/AdminDashboard.tsx; source review only', 'Review/audit API + frontend')
add('X03','Admin workspace','P1','M','Separate financial amounts and statuses',
    'The console includes payment summaries, bank details, payment records and payout actions.',
    'Use clear columns for service value, customer payment, refunds, platform share and artist payout; show date range and currency. Use status-specific actions and a confirmation summary for consequential changes.',
    'An operator can distinguish money collected from money paid out and see the effect before confirming an action.', 'admin/AdminDashboard.tsx payment workspace; source review only', 'Finance data definitions + frontend')

add('Q01','Accessibility & quality','P0','M','Correct the color contrast assumptions',
    'accessibility.css comments claim white on #D97A8C is 5:1. The calculated solid-color contrast is about 2.95:1; white on #F2A4B0 is about 1.96:1.',
    'Audit actual rendered text/control pairs, gradients and selected states. Use dark plum for main actions or a darker rose. Proposed white on #AD4968 is about 5.34:1; white on #35252F is about 14.41:1.',
    'Normal text reaches 4.5:1 and applicable large text/non-text controls 3:1. Test rendered states rather than relying on comments.', 'styles/accessibility.css; calculated WCAG sRGB luminance; W3C quick reference')
add('Q02','Accessibility & quality','P1','M','Complete keyboard and dialog behavior',
    'Dialogs generally have labels and Escape handlers, but consistent focus trapping/return is not established across all customer dialogs. A SkipLink component exists but is not mounted in the inspected App.',
    'Make dialogs focus-contained with initial focus, Escape and focus return. Add a skip link, logical headings, accessible calendars, selected states, useful alt text and announced errors/results. Prevent sticky bars from hiding focused controls.',
    'Browse → filter → profile → request is keyboard-completable; 200% zoom and a screen-reader pass reveal no lost content.', 'App.tsx; Header.tsx; DiscoverPage.tsx; ArtistDetailPage.tsx', 'Frontend + manual accessibility QA')
add('Q03','Accessibility & quality','P1','M','Design mobile states deliberately',
    'The mobile booking sheet exists and opens correctly in the reviewed public profile; it still exposes a long form and tiny disabled date labels.',
    'Use 44–48px touch targets as the product goal, readable secondary text, safe-area padding and a sticky action/summary. Account for the on-screen keyboard, long artist names, landscape and empty/error states.',
    'Test 360, 390, 768, 1024 and 1440px layouts; no horizontal overflow, covered actions or trapped nested scrolling.', 'Live 390 × 844 booking sheet; responsive styles')
add('Q04','Accessibility & quality','P1','M','Reduce media cost and measure actual speed',
    'The first five desktop slideshow PNGs total about 8.88 MB. Source preloads slideshow/About imagery. No Lighthouse or real-user speed score was measured.',
    'Serve responsive AVIF/WebP, prioritize one hero, defer offscreen media, reserve image dimensions and avoid unnecessary eager preloads. Measure homepage, results and profile on realistic mobile connections.',
    'Track LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile; these are targets, not claimed current results.', 'public/slideshow/1–5.png file sizes; LandingPage.tsx preload effect; Google Core Web Vitals', 'Media pipeline + frontend + measurement')
add('Q05','Accessibility & quality','P1','M','Make loading, empty and offline states actionable',
    'Different routes use skeletons, blank auth guards, error messages and empty lists with different recovery behavior.',
    'Create shared state patterns: loading with a stable layout; no matching results with edits; true empty account with a next step; error with Retry; offline with clear limits. Keep forms and filters intact after recoverable failures.',
    'A network failure never looks like zero saved artists, all dates booked or an account with no appointments.', 'App.tsx guard loading; SavedPage.tsx; DiscoverPage.tsx; ArtistDetailPage.tsx')
add('Q06','Accessibility & quality','P2','M','Make About, help and not-found pages useful',
    'About and NotFound routes exist; the public site emphasizes broad platform storytelling and trust language.',
    'Use About to explain curation, service area and people behind LUME. Give FAQs direct policy links and concise answers. A 404 should offer search, artist discovery and preserved navigation, while distinguishing a removed artist from a bad URL.',
    'Every secondary page provides a useful route back to the customer task and uses the same supported policies.', 'AboutPage.tsx; NotFound.tsx; Footer.tsx', 'Content + frontend')
add('Q07','Accessibility & quality','P2','M','Improve shareability and search previews',
    'The public pages reviewed use the same general title; routes have artist-specific content and the local source is adding readable slugs.',
    'Add unique page titles/descriptions, actual live h1 text, canonical routes and relevant social-preview images. Use structured artist/service information only when accurate; keep personal booking/account pages out of public indexing.',
    'Sharing an artist produces the correct artist preview, and category/search URLs retain meaningful context.', 'Live page titles; App.tsx; ArtistDetailPage.tsx slug handling', 'Metadata/rendering strategy + frontend')

refs = [
    dict(name='Fresha', url='https://www.fresha.com/', image='reference-fresha.jpg',
         take='Service + location + time are grouped into one dominant search action.',
         adapt='Use occasion + city + optional date. Preserve LUME’s beauty identity and request-before-payment model.',
         avoid='Do not borrow platform-scale booking counts or instant-booking claims.'),
    dict(name='Treatwell', url='https://www.treatwell.co.uk/', image='reference-treatwell.jpg',
         take='The first screen pairs beauty imagery with a plainly labeled service, area and date form.',
         adapt='Use a compact mobile form and a strong primary search action.',
         avoid='Do not import discount-heavy merchandising or a salon-only service structure.'),
    dict(name='WedMeGood bridal directory', url='https://www.wedmegood.com/vendors/all/bridal-makeup/', image='reference-wedmegood.jpg',
         take='Cards state bridal makeup price, review count, location and practical details such as trials/travel.',
         adapt='Make Indian occasion pricing and service inclusions equally explicit, with a calmer card hierarchy.',
         avoid='Do not replicate dense badges, unrelated vendor navigation or other artists’ photos.'),
]
evidence_images = [
    ('current-home-desktop.jpg','Current homepage','The main proposition is embedded in campaign imagery; search is near the bottom.'),
    ('current-discover-desktop.jpg','Current discovery','Intro, search and category circles push the first result below the viewport.'),
    ('current-artist-desktop.jpg','Current artist profile','Useful profile/gallery foundation, but duplicate stats and an ambiguous booking sidebar.'),
    ('current-mobile-booking.jpg','Current mobile booking','All displayed dates are Full; Reserve is disabled without an alternative.'),
    ('current-categories-desktop.jpg','Current categories','Several category images show tools or props rather than finished makeup.'),
    ('current-register-desktop.jpg','Current registration','Profile enrichment fields lengthen first-time account creation.'),
]

intro = """# LUME — UI/UX review & design vision

**26 October 2026 · Proposal for review · Website implementation not started**

## Recommendation

Evolve LUME into a warm, editorial beauty marketplace with a much clearer booking journey. Keep the blush identity, serif headings and focus on individual artists. Spend the first effort on truthful prices, availability, payment states and accessibility; then simplify discovery and apply the visual polish.

The intended feeling is **beauty with clarity**: reassuring, personal and refined. A customer should quickly answer: Does this artist create my look? Do they serve my location? What will the service cost? Can I request my date? What happens after I send the request?

## Review scope and limits

Reviewed the published **https://hellolume.in/** public homepage, discovery/results, filter dialog, an artist profile, categories, sign-in and client registration. Inspected the mobile artist booking sheet at 390 × 844. Reviewed the active route map and local source for saved artists, customer account, payment/confirmation, artist workspace, admin and shared components. These are the website associated with this workspace; no Page was attached to the chat.

**Evidence labels matter:** Live means directly observed on the public site. Source means found in this local checkout, which already contains uncommitted work and can differ from production. Workspace recommendations are source-based, not a claim that the authenticated screens were browser-tested. No accounts, requests or payments were created; no production data was changed. No analytics, user interviews, full assistive-technology audit or measured performance run was available. Treat conversion benefits as hypotheses to validate, not promised uplifts.

## Preserve

- The recognizable LUME name/logo and warm blush character.
- Editorial serif headings paired with practical sans-serif body text.
- Artist individuality, existing portfolio lightbox, genuine review/verification structures and the mobile booking sheet.
- Guest artist browsing and frictionless guest saving.
- The artist-acceptance-before-payment business flow, unless deliberately changed as a separate product decision.

## First decisions

1. **Visual direction:** choose Warm editorial (recommended), Rose continuity or Clean studio.
2. **Service language:** separate occasion from desired look; agree the package/inclusion model.
3. **Booking contract:** agree when a date is held/secured, response guidance, and how changes/cancellations work.
4. **Payment policy:** reconcile the existing 25%/50% advance mismatch and approve one source of truth.
5. **First implementation scope:** prioritize the P0 corrections and one complete customer journey before secondary features.

These are decisions for a subsequent conversation, not approvals already granted.

## Proposed visual direction

| Direction | Look and feel | Trade-off | Recommendation |
|---|---|---|---|
| Warm editorial | Ivory, plum actions, dusty rose details, strong makeup photography, restrained serif headlines | Requires disciplined media selection and component cleanup | Best balance of beauty and booking clarity |
| Rose continuity | Retain today’s pink-forward identity while fixing hierarchy, contrast, forms and spacing | Less visual change; decorative patterns still need restraint | Good if brand continuity is the main constraint |
| Clean studio | White-led, quieter serif use, dark actions and denser results | Fast-scanning utility with a less expressive brand feel | Consider for the artist/admin workspaces |

![Proposed LUME desktop and mobile concept — generated sample content](assets/proposed-vision.png)

**Concept limitations:** AI-generated visual exploration, not a functional design or final specification. People, counts, ratings, availability and prices are fictional. The image illustrates layout, palette and hierarchy; it must not supply production reviews, artist work or business promises. The concept’s loose estimated-price note must be replaced with a precise inclusions/fees breakdown before a real request. Real portfolio images require permission and credit.

### Design system proposal

| Element | Proposed rule |
|---|---|
| Palette | Ivory #FBF7F3; plum #35252F for actions/text; dusty rose #AD4968 for accents; champagne only as decoration |
| Typography | Keep Playfair Display for selected headlines and Inter for UI; avoid long italic sentences and all-caps instructions |
| Type scale | Body 16px; labels/secondary copy 14px where practical; screen titles 28–40px; marketing hero 44–64px desktop, 32–40px mobile |
| Layout | Consistent 8px spacing rhythm; 1200px maximum content width; 16–20px phone gutters, 32–48px desktop gutters |
| Controls | Primary action 48px high, field labels always visible, 44–48px practical touch targets; precise selected/focus/error states |
| Surfaces | 12–16px card radii, subtle neutral border, minimal shadows; reserve pills for tags/compact filters |
| Photography | Actual finished looks, inclusive skin tones/ages/styles, natural skin detail, consistent 4:5 portfolio-card crops |
| Motion | 150–200ms feedback where helpful; no forced entry delay; pauseable optional media and reduced-motion behavior |

## Screen-by-screen target

| Screen | Proposed hierarchy | Primary action |
|---|---|---|
| Home | Clear proposition → search → occasions → relevant artists → request process → proof/FAQ | Find artists |
| Discovery | Search criteria → result count + sort → filters → comparable portfolio cards | View artist |
| Looks & occasions | Finished looks → short explanations → relevant artists | Explore artists |
| Artist | Identity + work → packages → location/inclusions → reviews → request panel | Send booking request |
| Request review | Service → date/start time/duration → venue/contact → itemized summary | Send booking request |
| Request status | Truthful state → next expected action → request details → support | View request / Pay after acceptance |
| Saved | Saved artists → common criteria → optional comparison | View artist / Compare |
| Sign-in/register | Essential auth fields → recovery → return to saved booking draft | Continue |
| Customer account | Next appointment → attention needed → history → preferences/settings | Context-specific booking action |
| Artist workspace | Requests → today → awaiting payment → calendar/profile setup | Accept/review request |
| Admin | Action queues → evidence/details → safe intervention → secondary analytics | Review next item |
| About/help/404 | Useful explanation or recovery → relevant route back | Find an artist / Get help |

## Journey and language

**Browse → Filter → Inspect work/packages → Select service/date/time → Sign in if needed, preserving draft → Review → Send request → Await artist → Accepted, payment required → Pay agreed advance/full → Appointment secured → Complete → Review.**

The exact relationship between advance paid and confirmed must be agreed with the existing backend. Do not collapse PARTIALLY_PAID, ACCEPTED and CONFIRMED into one generic success state. Declined, expired, cancelled and payment-verification-pending states need their own next actions.

| Current wording | Suggested wording | Why |
|---|---|---|
| Reserve | Send booking request | Does not imply an already secured appointment |
| Occasion (generic price type) | Name the actual package | Explains what the customer is purchasing |
| From ₹3,000 | Hourly from ₹3,000/hr, or the searched service’s price | Preserves price basis |
| Full when schedule is absent | Availability not published / Could not load availability | Distinguishes unavailability from missing information |
| Booking Requested! | Request sent. We’ll update you when the artist responds. | Gives a truthful next event without inventing an SLA |
| 25% / 50% advance | One configured policy and exact due-now amount | Keeps customer-facing promises aligned |

## Priority and effort key

**P0:** correct before promoting the affected journey: misleading data, payment/booking state, unavailable-date dead end, or major contrast issue. **P1:** core usability/design-system improvement. **P2:** optional polish or later capability.

**S:** small/local change, generally up to 1–2 working days. **M:** several components or states, roughly 3–5 working days. **L:** feature/API/content dependencies, generally a week or more. These are rough implementation sizes per item, not commitments or additive project estimates. Discovery, QA and existing changes can alter them.
"""

closing = """## Delivery sequence to consider

**Stage 1 — Truth and continuity.** Resolve price labels, advance/payment policy, state mappings, schedule recovery, fictional defaults, hardcoded metrics, contrast and interrupted sign-in. Requires business rules as well as frontend work. Exit when a customer and artist agree on service, amount and status through an advance-paid appointment.

**Stage 2 — The customer journey.** Build a shared component sheet, then redesign Home → Discover → Artist → Request review/status and Saved in desktop and mobile. Use real approved media and all loading/empty/error states. Exit with one coherent end-to-end prototype and verified implementation of the approved scope.

**Stage 3 — Workspaces and operations.** Apply the same state model to customer appointments, artist setup/calendar/requests and admin queues. Validate with real authorized test accounts and representative non-production records.

**Stage 4 — Optional differentiation.** Add comparison, cross-device shortlists, richer look collections and other refinements only after the underlying data and journey are reliable. A map view, reels feed, AI matching quiz, chat system or broad rebrand should not displace the earlier work without evidence of user need.

## Validation plan and success measures

Run a small formative round with about five prospective customers and three working artists; recruit a mix of device experience and makeup occasions. This is a recommended research plan, not research already completed. Ask customers to find a relevant artist within a budget, explain an hourly versus package price, recover from no availability, submit a draft request, and identify the next step after acceptance. Ask artists to publish a service, set exceptions and locate an advance-paid appointment.

Track the funnel separately: search submitted → result opened → service chosen → request started → sign-in completed → request sent → artist accepted → payment verified. Also record no-result searches, unavailable-date exits, request-form errors, payment-verification delays and support questions about price/status. Establish baselines first; do not attach invented percentage improvements to a redesign.

Check layouts at 360/390/768/1024/1440px, keyboard-only use, 200% zoom, a screen reader, reduced motion, slow/offline requests, long names, no reviews, missing images and delayed payment confirmation. Core Web Vitals targets are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile, per Google guidance. No current score was measured in this review.

For accessibility, use WCAG 2.2 AA as the target: applicable normal-text contrast 4.5:1, large-text contrast 3:1, visible keyboard focus, labels/errors and reflow. Aim for 44–48px touch controls as the product standard; WCAG 2.2 AA’s minimum target-size criterion is 24 × 24 CSS px with defined exceptions, not a blanket 44px rule.

## Reference notes

Reference screenshots were captured from public websites on 26 October 2026. They are comparison material; their images, identities and performance claims are not assets to reuse in LUME. Their value here is the identified interface pattern, not an assertion that the whole reference experience is superior.

- [Fresha](https://www.fresha.com/): dominant service/location/time search and clear separation of customer versus business entry.
- [Treatwell](https://www.treatwell.co.uk/): a direct service/area/date form beside beauty imagery; adapt the clarity with LUME’s own visual language.
- [WedMeGood bridal makeup](https://www.wedmegood.com/vendors/all/bridal-makeup/): India-specific service price labels, review counts, trials and travel context.
- [W3C WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/): accessibility criteria, including contrast, labels, focus and target size.
- [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals): loading, interaction and stability measurement targets.

## What has been delivered

This folder contains the visual review in **index.html**, this written audit, **findings.json** for the prioritized backlog, current-screen evidence and three reference screenshots, plus a generated concept image and its full prompt. The HTML review lets you record a local preference per recommendation and export those preferences. These are planning notes, not executable approvals or changes to the website.

Only this documentation folder was created. Existing application files and uncommitted work were left intact. The generated concept used the built-in image generation tool; its exact prompt is saved in **vision-prompt.txt**.
"""

def image_markup(file, title, caption):
    return f'<figure><a href="assets/{escape(file)}" target="_blank"><img src="assets/{escape(file)}" alt="{escape(title)}" loading="lazy"></a><figcaption><strong>{escape(title)}</strong><span>{escape(caption)}</span></figcaption></figure>'

md = intro + '\n## Current-screen evidence\n\n'
for file, title, caption in evidence_images:
    md += f'### {title}\n\n![{title}](assets/{file})\n\n{caption}\n\n'
md += '\n## Detailed recommendations\n\n'
for area in dict.fromkeys(i['area'] for i in items):
    md += f'### {area}\n\n'
    for i in [x for x in items if x['area']==area]:
        md += f"#### {i['id']} · {i['title']} — {i['priority']} / {i['effort']}\n\n"
        md += f"**Evidence:** {i['observed']}\n\n**Change:** {i['change']}\n\n**Acceptance:** {i['acceptance']}\n\n**Where checked:** {i['evidence']}. **Dependency:** {i['dependency']}.\n\n"
md += closing
for ref in refs:
    md += f"\n### {ref['name']} screenshot\n\n![{ref['name']} reference](assets/{ref['image']})\n\nTake: {ref['take']} Adapt: {ref['adapt']} Avoid: {ref['avoid']}\n"
(ROOT/'LUME-UI-UX-REVIEW.md').write_text(md,encoding='utf-8')
(ROOT/'findings.json').write_text(json.dumps(items,indent=2,ensure_ascii=False),encoding='utf-8')

# Render the narrative Markdown without a dependency. Only our fixed document syntax is needed.
import re
def inline(s):
    s=escape(s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',s)
    s=re.sub(r'\[([^]]+)\]\((https://[^)]+)\)',r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>',s)
    return s
def narrative(s):
    lines=s.splitlines(); out=[]; p=[]; in_list=False; table=[]
    def flush():
        if p: out.append('<p>'+inline(' '.join(p))+'</p>'); p.clear()
    def flush_table():
        if table:
            rows=[x for x in table if not re.match(r'^\|[\s:|\-]+\|$',x)]
            out.append('<div class="table-wrap"><table>')
            for n,row in enumerate(rows):
                tag='th' if n==0 else 'td'
                out.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>' for c in row.strip('|').split('|'))+'</tr>')
            out.append('</table></div>'); table.clear()
    for line in lines+['']:
        if line.startswith('|'):
            flush(); table.append(line); continue
        flush_table()
        if not line.strip():
            flush()
            if in_list: out.append('</ul>'); in_list=False
            continue
        if line.startswith('#'):
            flush(); level=len(line)-len(line.lstrip('#'))
            if level==1: continue
            out.append(f'<h{level}>'+inline(line[level:].strip())+f'</h{level}>'); continue
        if line.startswith('!['):
            flush(); m=re.match(r'!\[([^]]+)\]\(([^)]+)\)',line)
            out.append(f'<a href="{m[2]}" target="_blank"><img class="vision-image" src="{m[2]}" alt="{escape(m[1])}" loading="lazy"></a>'); continue
        if line.startswith('- ') or re.match(r'^\d+\. ',line):
            flush()
            if not in_list: out.append('<ul>'); in_list=True
            out.append('<li>'+inline(re.sub(r'^(?:- |\d+\. )','',line))+'</li>'); continue
        p.append(line)
    return '\n'.join(out)

reference_html=''.join(f'''<article class="reference"><a href="{r['url']}" target="_blank" rel="noopener noreferrer"><img src="assets/{r['image']}" alt="{r['name']} interface reference" loading="lazy"></a><div><h3><a href="{r['url']}" target="_blank" rel="noopener noreferrer">{r['name']} ↗</a></h3><p><strong>Pattern:</strong> {r['take']}</p><p><strong>For LUME:</strong> {r['adapt']}</p><p class="muted"><strong>Avoid:</strong> {r['avoid']}</p></div></article>''' for r in refs)
findings_html=''
for i in items:
    findings_html+=f'''<details class="finding" data-area="{escape(i['area'])}" data-priority="{i['priority']}" data-id="{i['id']}"><summary><span class="badge {i['priority']}">{i['priority']}</span><span class="finding-title"><span class="meta">{i['id']} · {i['area']} · Size {i['effort']}</span><strong>{i['title']}</strong></span><span class="expand" aria-hidden="true">+</span></summary><div class="finding-content"><p><strong>What I found</strong><br>{escape(i['observed'])}</p><p><strong>Proposed change</strong><br>{escape(i['change'])}</p><p><strong>Acceptance check</strong><br>{escape(i['acceptance'])}</p><p class="muted"><strong>Evidence:</strong> {escape(i['evidence'])}<br><strong>Depends on:</strong> {escape(i['dependency'])}</p><label class="decision-label">Your preference for {i['id']}<select data-decision="{i['id']}"><option value="undecided">Undecided</option><option value="consider">Consider for scope</option><option value="later">Later</option><option value="skip">Skip</option></select></label></div></details>'''

style="""
:root{--paper:#fbf7f3;--white:#fff;--ink:#35252f;--muted:#675961;--rose:#ad4968;--line:#e2d7d9;--soft:#f2e7e8;--danger:#8d2934;--good:#33634d;font-family:'Segoe UI',Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.65;color-scheme:light}
*{box-sizing:border-box}body{margin:0}a{color:var(--rose);text-underline-offset:4px}button,input,select{font:inherit}button,select{cursor:pointer}button,a,summary,input,select{touch-action:manipulation}:focus-visible{outline:3px solid var(--rose);outline-offset:4px}.skip{position:fixed;left:16px;top:-100px;background:#fff;padding:12px;z-index:20}.skip:focus{top:12px}
.mast{border-bottom:1px solid var(--line);padding:16px 5vw;display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--paper)}.logo{font:30px Georgia,serif;letter-spacing:4px}.mast small{color:var(--muted)}main{max-width:1200px;margin:auto;padding:0 40px 64px}h1,h2,h3{font-family:Georgia,'Times New Roman',serif;font-weight:400;line-height:1.16}h1{font-size:clamp(42px,6vw,76px);letter-spacing:-2px;max-width:830px;margin:22px 0}h2{font-size:36px;margin:48px 0 24px}h3{font-size:25px;margin:26px 0 12px}p{max-width:900px;margin:14px 0 22px}li{padding:4px 0}.kicker,.meta{text-transform:uppercase;font-size:12px;letter-spacing:1.3px;color:var(--muted)}.hero{padding:64px 0 34px}.lead{font-size:21px;max-width:800px;color:var(--muted)}.hero-footer{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.pill{background:var(--soft);padding:6px 13px;border-radius:99px;font-size:13px}.outline{border:1px solid var(--line);background:transparent}.toc{display:flex;gap:22px;overflow:auto;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 0;white-space:nowrap}.toc a{font-size:14px;text-decoration:none;color:var(--ink)}section{scroll-margin-top:24px}.note{padding:20px 24px;border-left:3px solid var(--rose);background:var(--soft);margin:24px 0}.note p{margin:0}.vision-image{display:block;width:100%;height:auto;border-radius:14px;border:1px solid var(--line)}.table-wrap{overflow-x:auto;margin:24px 0}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border-bottom:1px solid var(--line);text-align:left;vertical-align:top;padding:14px 16px;min-width:145px}th{background:var(--soft);font-weight:600}td:first-child{font-weight:600}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0;background:var(--white);border:1px solid var(--line);border-radius:12px;overflow:hidden}figure img{width:100%;height:310px;object-fit:contain;background:#f7f4f4;display:block}figcaption{padding:18px 20px;font-size:14px}figcaption strong,figcaption span{display:block}figcaption span{margin-top:7px;color:var(--muted)}.reference{display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:start;padding:28px 0;border-bottom:1px solid var(--line)}.reference img{width:100%;border:1px solid var(--line);border-radius:10px}.reference h3{margin-top:0}.reference p{font-size:14px;margin-bottom:12px}.muted{color:var(--muted)}.toolbar{display:flex;gap:14px;flex-wrap:wrap;align-items:end;background:var(--white);border:1px solid var(--line);padding:18px;margin:24px 0;border-radius:12px}.toolbar label{font-size:13px;flex:1;min-width:145px}.toolbar select,.toolbar input{display:block;width:100%;margin-top:6px;padding:10px;border:1px solid var(--line);border-radius:6px;background:var(--white);color:var(--ink)}button{border:1px solid var(--line);border-radius:8px;background:var(--white);padding:11px 16px;color:var(--ink);min-height:46px}.primary{background:var(--ink);color:#fff}.finding{border-bottom:1px solid var(--line);background:var(--white)}.finding summary{display:flex;align-items:center;gap:18px;cursor:pointer;padding:20px;list-style:none}.finding summary::-webkit-details-marker{display:none}.finding-title{flex:1}.finding-title strong,.finding-title .meta{display:block}.finding-title strong{font-size:17px;margin-top:3px;font-weight:600}.finding .meta{font-size:11px;letter-spacing:.6px}.badge{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:30px;border-radius:5px;font-size:12px;font-weight:700;background:var(--soft)}.badge.P0{background:#f5dce0;color:#7c2034}.badge.P1{background:#ebe4ec;color:#50325b}.badge.P2{background:#e8ece9;color:#34513d}.finding-content{padding:0 24px 24px 80px}.finding-content p{font-size:14px;margin:0 0 18px}.finding[open] .expand{transform:rotate(45deg)}.expand{font-size:26px;color:var(--muted)}.decision-label{font-size:13px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}.decision-label select{padding:10px;border:1px solid var(--line);border-radius:6px;background:var(--paper);color:var(--ink)}.count-row{display:flex;justify-content:space-between;gap:15px;align-items:center;margin:20px 0}.count-row p{margin:0;font-size:14px}.counts{display:flex;gap:12px;flex-wrap:wrap}.counts span{padding:8px 13px;border:1px solid var(--line);border-radius:6px;font-size:13px}.footer{border-top:1px solid var(--line);padding:32px 0;margin-top:48px;color:var(--muted);font-size:13px}[hidden]{display:none!important}.swatches{display:flex;gap:12px;flex-wrap:wrap}.swatch{width:150px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}.swatch div{height:65px}.swatch p{margin:10px 12px;font-size:12px}.export-box{width:100%;min-height:140px;padding:14px;border:1px solid var(--line);background:#fff;color:var(--ink);font:14px/1.6 Consolas,monospace}.review-actions{display:flex;gap:12px;flex-wrap:wrap}.flow{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}.flow span{padding:10px 14px;border:1px solid var(--line);background:#fff;font-size:13px;border-radius:7px}.flow .final{background:var(--ink);color:white}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:24px}.comparison h3{font-family:'Segoe UI',sans-serif;font-size:16px;font-weight:600}.comparison figure img{height:360px}noscript{display:block;background:var(--soft);padding:20px}
@media(max-width:700px){main{padding:0 18px 40px}.mast{padding:14px 18px;align-items:start}.mast small{max-width:180px;text-align:right}.hero{padding-top:38px}.hero h1{letter-spacing:-1px}.lead{font-size:18px}h2{font-size:29px}.gallery,.comparison,.reference{grid-template-columns:1fr}.reference{gap:18px}.finding summary{padding:16px 12px;gap:10px}.finding-content{padding:0 16px 20px}.finding-title strong{font-size:15px}.count-row{align-items:start;flex-direction:column}figure img{height:260px}.toc{gap:20px}.swatch{width:calc(50% - 6px)}}
@media print{.toolbar,.toc,.review-actions,.decision-label,.skip{display:none}body{background:white}main{padding:0;max-width:none}.hero{padding:10px 0}.finding{break-inside:avoid}details:not([open]) .finding-content{display:block}.gallery{grid-template-columns:1fr 1fr}figure img{height:210px}h1{font-size:42px}h2{break-after:avoid}a{color:var(--ink)}.reference{break-inside:avoid}.export-box{display:none}}
"""

intro_before_vision=intro.split('## Proposed visual direction')[0]
vision_narrative='## Proposed visual direction'+intro.split('## Proposed visual direction')[1].split('## Screen-by-screen target')[0]
screens_narrative='## Screen-by-screen target'+intro.split('## Screen-by-screen target')[1].split('## Priority and effort key')[0]
priority_narrative='## Priority and effort key'+intro.split('## Priority and effort key')[1]

html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LUME — UI/UX review & design vision</title><style>{style}</style></head><body><a class="skip" href="#main">Skip to review</a><header class="mast"><div class="logo">LUME</div><small>UI/UX REVIEW · 26 OCTOBER 2026<br>Proposal for discussion</small></header><main id="main"><div class="hero"><div class="kicker">THE NEXT CHAPTER</div><h1>Beautiful to explore.<br>Clear to book.</h1><p class="lead">A complete proposal for evolving LUME’s interface, customer journey and workspaces — with current evidence, visual references and a practical order of work.</p><div class="hero-footer"><span class="pill">{len(items)} recommendations</span><span class="pill">Desktop + mobile</span><span class="pill outline">No website implementation started</span></div></div><nav class="toc" aria-label="Review contents"><a href="#overview">Overview</a><a href="#vision">Design vision</a><a href="#evidence">Current screens</a><a href="#journey">Target journey</a><a href="#references">References</a><a href="#backlog">Recommendations</a><a href="#delivery">Sequence & validation</a></nav>
<section id="overview">{narrative(intro_before_vision)}</section>
<section id="vision">{narrative(vision_narrative)}<div class="swatches">{''.join(f'<div class="swatch"><div style="background:{c}"></div><p>{n}<br>{c}</p></div>' for n,c in [('Ivory','#FBF7F3'),('Plum','#35252F'),('Dusty rose','#AD4968'),('Champagne','#D7B99B')])}</div></section>
<section id="evidence"><h2>What the current screens show</h2><p>Public-site evidence captured on 26 October 2026. Click an image to inspect it at full size. Recommendations about authenticated workspaces come from local source inspection.</p><div class="gallery">{''.join(image_markup(*x) for x in evidence_images)}</div></section>
<section id="journey">{narrative(screens_narrative)}</section>
<section id="references"><h2>Reference patterns to adapt</h2><p>These references inform individual patterns. Keep LUME’s own brand, portfolio assets and booking rules.</p>{reference_html}<p class="muted">Reference screenshots are comparison material captured on 26 October 2026. Counts and promotional claims belong to those sites. They are not LUME content.</p></section>
<section id="backlog"><h2>The proposed changes</h2>{narrative(priority_narrative)}<div class="counts">{''.join(f'<span>{p}: {Counter(i["priority"] for i in items)[p]} recommendations</span>' for p in ['P0','P1','P2'])}</div><div class="toolbar"><label>Area<select id="area"><option value="all">All areas</option>{''.join(f'<option>{escape(x)}</option>' for x in dict.fromkeys(i['area'] for i in items))}</select></label><label>Priority<select id="priority"><option value="all">All priorities</option><option>P0</option><option>P1</option><option>P2</option></select></label><label>Search recommendations<input type="search" id="search" placeholder="e.g. price, mobile, calendar"></label></div><div class="count-row"><p id="result-count" role="status">Showing {len(items)} recommendations</p><div class="review-actions"><button id="expand-all">Expand visible</button><button id="collapse-all">Collapse all</button></div></div><noscript>All recommendations are readable below. Enable JavaScript for filtering and local decision notes.</noscript><div id="findings">{findings_html}</div><p id="no-results" hidden>No recommendations match. Change the filters or search.</p><div class="note"><p>Record preferences to guide the next discussion. They stay in this browser where storage is available, do not contact any server, and do not authorize implementation. Export a copy for durable notes.</p></div><button id="export" class="primary">Export my review notes</button><p id="storage-status" class="muted" role="status"></p><label for="export-text" id="export-label" hidden>Copyable review notes</label><textarea id="export-text" class="export-box" hidden readonly></textarea></section>
<section id="delivery">{narrative(closing)}</section><footer class="footer">LUME UI/UX review · Prepared for a design decision, not deployment.<br><a href="LUME-UI-UX-REVIEW.md">Written audit</a> · <a href="findings.json">Structured recommendations</a> · <a href="vision-prompt.txt">Concept-generation prompt</a></footer></main>
<script>
const findings=[...document.querySelectorAll('.finding')];
const area=document.getElementById('area'), priority=document.getElementById('priority'), search=document.getElementById('search');
const statuses=document.getElementById('storage-status');
let choices={{}};try{{choices=JSON.parse(localStorage.getItem('lume-ux-review-2026-10-26')||'{{}}')}}catch(e){{statuses.textContent='Browser storage is unavailable. Export notes before closing.'}}
if(!choices||typeof choices!=='object'||Array.isArray(choices))choices={{}};
function filter(){{const q=search.value.toLowerCase().trim();let n=0;findings.forEach(el=>{{const match=(area.value==='all'||el.dataset.area===area.value)&&(priority.value==='all'||el.dataset.priority===priority.value)&&(!q||el.textContent.toLowerCase().includes(q));el.hidden=!match;if(match)n++}});document.getElementById('result-count').textContent=`Showing ${{n}} of ${{findings.length}} recommendations`;document.getElementById('no-results').hidden=n!==0}}
[area,priority,search].forEach(el=>el.addEventListener('input',filter));
document.getElementById('expand-all').onclick=()=>findings.filter(el=>!el.hidden).forEach(el=>el.open=true);
document.getElementById('collapse-all').onclick=()=>findings.forEach(el=>el.open=false);
document.querySelectorAll('[data-decision]').forEach(el=>{{if(['undecided','consider','later','skip'].includes(choices[el.dataset.decision]))el.value=choices[el.dataset.decision];el.addEventListener('change',()=>{{choices[el.dataset.decision]=el.value;try{{localStorage.setItem('lume-ux-review-2026-10-26',JSON.stringify(choices));statuses.textContent='Preference saved in this browser. Export for a durable copy.'}}catch(e){{statuses.textContent='Preference held for this view only. Export before closing.'}}}})}});
document.getElementById('export').onclick=()=>{{const rows=findings.map(el=>{{const title=el.querySelector('.finding-title strong').textContent;const decision=el.querySelector('select').value;return `${{el.dataset.id}} | ${{decision}} | ${{title}}`}});const text='LUME UI/UX review preferences — 26 October 2026\\nPlanning notes only; implementation not authorized.\\n\\n'+rows.join('\\n');const box=document.getElementById('export-text');box.hidden=false;document.getElementById('export-label').hidden=false;box.value=text;const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([text],{{type:'text/plain;charset=utf-8'}}));link.download='lume-ui-ux-review-decisions.txt';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);statuses.textContent='Export prepared. A copy is also shown below.'}};
</script></body></html>'''
(ROOT/'index.html').write_text(html,encoding='utf-8')
print(json.dumps({'recommendations':len(items),'priorities':dict(Counter(i['priority'] for i in items)),'html_bytes':len(html.encode()),'markdown_bytes':len(md.encode())}))
