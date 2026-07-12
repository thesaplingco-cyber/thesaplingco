/* ==========================================================================
   The Sapling Co. — bilingual (English / বাংলা) engine.
   Persistent language, applied on every page. Bengali copy is hand-authored
   to read naturally and warmly for a Bengal audience — not literal translation.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "sapling-lang";

  // key: [English, বাংলা]
  var DICT = {
    // ---- Navigation ----
    nav_home: ["Home", "হোম"],
    nav_about: ["About", "আমাদের কথা"],
    nav_inventory: ["Our Inventory", "আমাদের সংগ্রহ"],
    nav_care: ["Care Guides", "গাছের যত্ন"],
    nav_contact: ["Contact", "যোগাযোগ"],

    // ---- Common buttons / labels ----
    btn_request_sapling: ["Request a Sapling", "চারার জন্য অনুরোধ"],
    btn_call_us: ["Call Us", "ফোন করুন"],
    btn_view_collection: ["View collection", "সংগ্রহ দেখুন"],
    btn_browse_all: ["Browse all plants", "সব গাছ দেখুন"],
    btn_go_inventory: ["Go to inventory", "সংগ্রহে যান"],
    btn_read_story: ["Read our story", "আমাদের গল্প পড়ুন"],
    btn_call_now: ["Call now", "এখনই ফোন করুন"],
    btn_email_us: ["Email us", "ইমেল করুন"],
    btn_send_request: ["Send Request", "অনুরোধ পাঠান"],
    btn_send_message: ["Send message", "বার্তা পাঠান"],
    btn_get_directions: ["Get directions", "পথনির্দেশ দেখুন"],
    btn_call_before: ["Call before you visit", "আসার আগে ফোন করুন"],
    btn_google_review: ["Leave a Google review", "গুগলে রিভিউ দিন"],
    btn_shop_plants: ["Shop our plants", "গাছ দেখুন"],
    btn_browse_inventory: ["Browse our inventory", "আমাদের সংগ্রহ ঘুরে দেখুন"],
    btn_whatsapp: ["WhatsApp us", "হোয়াটসঅ্যাপে লিখুন"],
    btn_contact_us: ["Contact us", "যোগাযোগ করুন"],
    btn_request_plant: ["Request a plant", "চারার জন্য অনুরোধ"],
    btn_back_categories: ["Back to all categories", "সব বিভাগে ফিরে যান"],
    tag_coming_soon: ["Coming soon", "শীঘ্রই আসছে"],
    tag_full_guide_soon: ["Full guide coming soon", "সম্পূর্ণ গাইড শীঘ্রই আসছে"],
    badge_specialty: ["Our specialty", "আমাদের বিশেষত্ব"],
    badge_specialty_cat: ["Our specialty category", "আমাদের বিশেষ বিভাগ"],

    // ---- Hero carousel ----
    hero_eyebrow: ["Grown in Bengal · Delivered across India", "বাংলায় বেড়ে ওঠা · সারা ভারতে পৌঁছে যায়"],
    hero_h1: [
      "India's most loved home for indoor plants, <span class=\"accent\">exotic fruit saplings</span> &amp; flowering plants.",
      "ইনডোর গাছ, <span class=\"accent\">দুর্লভ ফলের চারা</span> আর ফুলের গাছের সবচেয়ে ভালোবাসার ঠিকানা।"
    ],
    hero_sub: [
      "Grown fresh in our own Uttarpara nursery and delivered to your door. We're not a warehouse — we're a real nursery, where every sapling is watched, watered, and loved.",
      "আমাদের নিজের উত্তরপাড়ার নার্সারিতে হাতে গড়া, আপনার দরজায় পৌঁছে দেওয়া। আমরা কোনো গুদাম নই — সত্যিকারের এক নার্সারি, যেখানে প্রতিটি চারাকে চোখে চোখে রেখে, জল দিয়ে, ভালোবেসে বড় করা হয়।"
    ],
    hero_t1: ["Grown in-house", "নিজেদের হাতে গড়া"],
    hero_t2: ["Hand-packed", "যত্নে প্যাক করা"],
    hero_t3: ["Home delivery", "বাড়িতে পৌঁছে দেওয়া"],

    slide_indoor_eyebrow: ["Our specialty", "আমাদের বিশেষত্ব"],
    slide_indoor_title: ["Explore Indoor Plants", "ইনডোর গাছের জগৎ"],
    slide_indoor_sub: ["Air-purifying foliage that turns any corner into calm.", "নিঃশ্বাসে টাটকা হাওয়া, প্রতিটি কোণে এক টুকরো প্রশান্তি।"],
    slide_indoor_cta: ["See indoor plants", "ইনডোর গাছ দেখুন"],

    slide_fruit_eyebrow: ["Rare & grafted", "দুর্লভ ও কলমের চারা"],
    slide_fruit_title: ["Exotic Fruit Saplings", "দুর্লভ ফলের চারা"],
    slide_fruit_sub: ["From Miyazaki mango to litchi, jackfruit and guava — fruit for your terrace.", "মিয়াজাকি আম থেকে লিচু, কাঁঠাল আর পেয়ারা — আপনার ছাদেই ফলের বাগান।"],
    slide_fruit_cta: ["See fruit saplings", "ফলের চারা দেখুন"],

    slide_flower_eyebrow: ["Colour all season", "সারা মরসুমে রং"],
    slide_flower_title: ["Rare Flowering Plants", "দুর্লভ ফুলের গাছ"],
    slide_flower_sub: ["Hibiscus, roses and bougainvillea in colours you won't find easily.", "জবা, গোলাপ আর বাগানবিলাস — এমন রঙে, যা সহজে মেলে না।"],
    slide_flower_cta: ["See flowering plants", "ফুলের গাছ দেখুন"],

    slide_visit_eyebrow: ["Come say hello", "একবার ঘুরে যান"],
    slide_visit_title: ["Visit Our Nursery", "আমাদের নার্সারিতে আসুন"],
    slide_visit_sub: ["Raghunathpur Naskarpara, Uttarpara, Hooghly — West Bengal. Pick your own plants.", "রঘুনাথপুর নস্করপাড়া, উত্তরপাড়া, হুগলি — পশ্চিমবঙ্গ। নিজে হাতে বেছে নিন আপনার গাছ।"],
    slide_visit_cta: ["Get directions", "পথনির্দেশ দেখুন"],

    // ---- Story ----
    story_eyebrow: ["Our story", "আমাদের কথা"],
    story_title: ["A real nursery, rooted in Bengal", "বাংলার মাটিতে শিকড় গাঁথা এক সত্যিকারের নার্সারি"],
    story_p1: [
      "The Sapling Co. was born from a simple belief — that every home deserves a living, breathing plant. Founded in Uttarpara, West Bengal, we are a nursery rooted in Bengal's fertile soil and rich tradition of nature.",
      "একটাই বিশ্বাস থেকে দ্য স্যাপলিং কো.-র জন্ম — প্রতিটি ঘরেই থাকুক একটুকরো প্রাণবন্ত সবুজ। উত্তরপাড়া, পশ্চিমবঙ্গে গড়ে ওঠা আমাদের নার্সারির শিকড় বাংলার উর্বর মাটি আর প্রকৃতির চিরকালীন ঐতিহ্যে।"
    ],
    story_p2: [
      "Every plant we grow is nurtured by hand, packed with care, and shipped across India so it arrives healthy, fresh, and ready to thrive in your space.",
      "আমাদের প্রতিটি গাছ হাতে হাতে যত্নে বড় করা, ভালোবেসে প্যাক করা, আর সারা ভারতে পাঠানো — যেন সুস্থ, সতেজ অবস্থায় আপনার ঘরে পৌঁছে নতুন করে বেড়ে ওঠে।"
    ],
    story_quote: [
      "We are not a warehouse. We are a real nursery — where every sapling has been watched, watered, and loved before it reaches you.",
      "আমরা কোনো গুদাম নই। আমরা সত্যিকারের এক নার্সারি — যেখানে প্রতিটি চারাকে চোখে চোখে রেখে, জল দিয়ে, ভালোবেসে বড় করা হয়, তারপর তা পৌঁছয় আপনার কাছে।"
    ],

    // ---- Stats ----
    stat1_b: ["Bengal", "বাংলা"], stat1_s: ["Founded & grown in-house", "নিজেদের হাতে গড়া"],
    stat2_b: ["70+", "৭০+"], stat2_s: ["Verified plant varieties", "যাচাই করা গাছের প্রজাতি"],
    stat3_b: ["Pan-India", "সারা ভারত"], stat3_s: ["Safe delivery ambition", "নিরাপদে পৌঁছনোর স্বপ্ন"],
    stat4_b: ["Real nursery", "সত্যিকারের নার্সারি"], stat4_s: ["Growers, not resellers", "চাষি, ব্যবসায়ী নই"],

    // ---- Categories ----
    cat_eyebrow: ["Explore what we grow", "দেখুন আমরা কী কী ফলাই"],
    cat_title: ["Shop by category", "বিভাগ অনুযায়ী দেখুন"],
    cat_sub: [
      "Seven collections across 180–220 plants and 70+ varieties — from everyday favourites to rare collector's plants. Click into any category to browse the full list.",
      "১৮০–২২০টি গাছ আর ৭০+ প্রজাতি জুড়ে সাতটি সংগ্রহ — রোজকার প্রিয় গাছ থেকে সংগ্রাহকের দুর্লভ গাছ। যেকোনো বিভাগে ক্লিক করে পুরো তালিকা দেখুন।"
    ],
    cat_indoor_name: ["Indoor Plants", "ইনডোর গাছ"],
    cat_indoor_desc: ["Aglaonema, ZZ, Calathea, Dieffenbachia & our foliage specialty.", "এগ্লোনিমা, জেডজেড, ক্যালাথিয়া, ডিফেনবেকিয়া — আমাদের পাতাবাহারের বিশেষত্ব।"],
    cat_fruit_name: ["Fruit Trees & Saplings", "ফলের গাছ ও চারা"],
    cat_fruit_desc: ["Premium grafted mango, guava, litchi, jackfruit & citrus.", "উন্নত কলমের আম, পেয়ারা, লিচু, কাঁঠাল ও লেবু।"],
    cat_flower_name: ["Flowering Shrubs & Trees", "ফুলের গাছ ও ঝোপ"],
    cat_flower_desc: ["Hibiscus, roses & bougainvillea in rare colours.", "দুর্লভ রঙের জবা, গোলাপ ও বাগানবিলাস।"],
    cat_succ_name: ["Succulents & Cactus", "সাকুলেন্ট ও ক্যাকটাস"],
    cat_succ_desc: ["Haworthia, aloe & a wide, easy-care cactus collection.", "হাওরথিয়া, ঘৃতকুমারী ও সহজ যত্নের বড় ক্যাকটাস সংগ্রহ।"],
    cat_palm_name: ["Palms & Coconut", "পাম ও নারকেল"],
    cat_palm_desc: ["Areca, coconut dwarfs & sago palms for tropical calm.", "এরিকা, বামন নারকেল ও সাগু পাম — গ্রীষ্মমণ্ডলীয় প্রশান্তি।"],
    cat_orn_name: ["Ornamental Foliage", "শোভাময় পাতাবাহার"],
    cat_orn_desc: ["Croton, cordyline & bold coloured-leaf plants.", "ক্রোটন, কর্ডিলাইন ও উজ্জ্বল রঙিন পাতার গাছ।"],
    cat_land_name: ["Landscape & Groundcover", "ল্যান্ডস্কেপ ও গ্রাউন্ডকভার"],
    cat_land_desc: ["Hedges, groundcovers & big-leaf tropicals.", "বেড়া, গ্রাউন্ডকভার ও বড় পাতার গ্রীষ্মমণ্ডলীয় গাছ।"],

    // ---- Why choose us ----
    why_eyebrow: ["Why choose us", "কেন আমরা"],
    why_title: ["Real growers you can trust", "যাদের ভরসা করা যায়, এমন চাষি"],
    why1_t: ["Grown in Bengal", "বাংলায় বেড়ে ওঠা"],
    why1_p: ["Grown fresh in our own nursery — never sourced from third-party warehouses.", "আমাদের নিজের নার্সারিতে টাটকা বেড়ে ওঠা — কোনো তৃতীয় পক্ষের গুদাম থেকে আনা নয়।"],
    why2_t: ["Safe packaging", "নিরাপদ প্যাকেজিং"],
    why2_p: ["Roots secured in coco peat, newspaper cushioning and a sturdy box marked “Live Plant”.", "শিকড় কোকো পিটে মোড়া, খবরের কাগজের কুশন আর “জীবন্ত গাছ” লেখা মজবুত বাক্সে সুরক্ষিত।"],
    why3_t: ["Home delivery available", "বাড়িতে পৌঁছে দেওয়া"],
    why3_p: ["Local delivery around the nursery, with clear, honest pricing — see below.", "নার্সারির আশপাশে স্থানীয় ডেলিভারি, স্বচ্ছ ও সৎ দামে — নিচে দেখুন।"],
    why4_t: ["Real nursery, real plants", "সত্যিকারের নার্সারি, সত্যিকারের গাছ"],
    why4_p: ["Every sapling is watched, watered and loved before it reaches you. Growers, not resellers.", "প্রতিটি চারাকে চোখে চোখে রেখে, জল দিয়ে, ভালোবেসে বড় করা হয়। আমরা চাষি, ব্যবসায়ী নই।"],
    why_specialty: [
      "Our particular strength is <strong>indoor ornamental foliage</strong> — Dieffenbachia, Aglaonema, ZZ Plant, Calathea, Lucky Bamboo, Gasteria and Haworthia — paired with a strong <strong>fruit sapling collection</strong>, for both everyday home gardeners and serious plant collectors.",
      "আমাদের বিশেষ শক্তি <strong>ইনডোর পাতাবাহার</strong> — ডিফেনবেকিয়া, এগ্লোনিমা, জেডজেড, ক্যালাথিয়া, লাকি ব্যাম্বু, গ্যাস্টেরিয়া আর হাওরথিয়া — সঙ্গে শক্তিশালী <strong>ফলের চারার সংগ্রহ</strong>; ঘরোয়া বাগানপ্রেমী থেকে গুরুতর সংগ্রাহক, সবার জন্য।"
    ],

    // ---- Order on call ----
    call_eyebrow: ["Order or ask on call", "ফোনেই অর্ডার বা প্রশ্ন"],
    call_p: [
      "Prefer to talk? Call us with any question, or to place an order. You can also email <a href=\"mailto:thesaplingco@gmail.com\">thesaplingco@gmail.com</a> — we reply within 24 hours.",
      "কথা বলতে চান? যেকোনো প্রশ্নে বা অর্ডার করতে ফোন করুন। ইমেলও করতে পারেন <a href=\"mailto:thesaplingco@gmail.com\">thesaplingco@gmail.com</a> — ২৪ ঘণ্টার মধ্যে উত্তর দিই।"
    ],

    // ---- Request form ----
    req_eyebrow: ["Request a sapling", "চারার জন্য অনুরোধ"],
    req_title: ["Tell us what you're looking for", "বলুন, কী খুঁজছেন"],
    req_p: [
      "No online cart yet — and that's on purpose. Send us a quick request and we'll get back to you by phone or email to confirm availability, price and delivery. If you don't see a plant listed, ask anyway — we probably have it, or can grow it for you.",
      "এখনো অনলাইন কার্ট নেই — আর সেটা ইচ্ছে করেই। ছোট্ট একটা অনুরোধ পাঠান, আমরা ফোন বা ইমেলে জানিয়ে দেব গাছটি আছে কিনা, দাম আর ডেলিভারি। তালিকায় কোনো গাছ না পেলেও জিজ্ঞেস করুন — হয়তো আমাদের কাছে আছে, বা আপনার জন্য বড় করে দিতে পারি।"
    ],
    req_li1: ["Fast reply, usually within 24 hours", "দ্রুত উত্তর, সাধারণত ২৪ ঘণ্টার মধ্যে"],
    req_li2: ["Pay on confirmation — no online payment needed", "নিশ্চিত হলে তবেই দাম — অনলাইন পেমেন্টের দরকার নেই"],
    req_li3: ["Honest advice on what thrives in your space", "আপনার জায়গায় কোন গাছ ভালো থাকবে, তার সৎ পরামর্শ"],
    f_name: ["Name", "নাম"],
    f_phone: ["Phone", "ফোন"],
    f_email: ["Email", "ইমেল"],
    f_opt: ["(optional)", "(ঐচ্ছিক)"],
    f_plant: ["Plant / sapling requested", "যে গাছ / চারা চান"],
    f_address: ["Delivery address / area", "ডেলিভারি ঠিকানা / এলাকা"],
    f_notes: ["Additional notes", "অতিরিক্ত কথা"],
    f_message: ["Message", "বার্তা"],
    f_order: ["Order / reference number", "অর্ডার / রেফারেন্স নম্বর"],
    ph_plant: ["e.g. Miyazaki Mango, Money Plant…", "যেমন মিয়াজাকি আম, মানি প্ল্যান্ট…"],
    ph_address: ["Area, city, PIN code", "এলাকা, শহর, পিন কোড"],
    ph_notes: ["Quantity, pot size, timing, questions…", "সংখ্যা, টবের মাপ, সময়, প্রশ্ন…"],
    ph_message: ["How can we help?", "কীভাবে সাহায্য করতে পারি?"],
    req_note: [
      "Submitting opens your email app with the details pre-filled — just press send. Or call us directly at +91 89022 62452.",
      "পাঠালে আপনার ইমেল অ্যাপ খুলবে, সব তথ্য আগে থেকে ভরা — শুধু সেন্ড চাপুন। বা সরাসরি ফোন করুন +91 89022 62452 নম্বরে।"
    ],
    form_ok: [
      "Thanks, {name}! Your email app should open — just hit send and we'll get back to you soon. Prefer to talk? Call ",
      "ধন্যবাদ, {name}! আপনার ইমেল অ্যাপ খুলবে — শুধু সেন্ড চাপুন, আমরা শীঘ্রই যোগাযোগ করব। কথা বলতে চাইলে ফোন করুন "
    ],

    // ---- Delivery ----
    del_eyebrow: ["Local delivery", "স্থানীয় ডেলিভারি"],
    del_title: ["Home delivery near the nursery", "নার্সারির কাছে বাড়িতে ডেলিভারি"],
    del_sub: [
      "We currently offer local home delivery around our Uttarpara nursery at simple, honest rates (added to your order). Pan-India shipping is coming soon.",
      "এখন আমরা উত্তরপাড়া নার্সারির আশপাশে সহজ, সৎ দামে স্থানীয় ডেলিভারি দিই (অর্ডারের সঙ্গে যোগ হয়)। সারা ভারতে ডেলিভারি শীঘ্রই আসছে।"
    ],
    del_within2: ["Within 2 km", "২ কিমি-র মধ্যে"],
    del_within4: ["Within 4 km", "৪ কিমি-র মধ্যে"],

    // ---- Visit ----
    visit_eyebrow: ["Visit our nursery", "আমাদের নার্সারিতে আসুন"],
    visit_title: ["Come see what we grow", "দেখে যান আমরা কী ফলাই"],
    visit_p: ["You're always welcome to visit in person and pick your own plants. Find us at:", "সবসময় স্বাগত — নিজে এসে বেছে নিন আপনার গাছ। আমাদের ঠিকানা:"],
    map_b: ["The Sapling Co. Nursery", "দ্য স্যাপলিং কো. নার্সারি"],
    map_s: ["Uttarpara, Hooghly · Tap to load map", "উত্তরপাড়া, হুগলি · ম্যাপ দেখতে ট্যাপ করুন"],

    // ---- Review ----
    review_h: ["Loved our plants or our service?", "আমাদের গাছ বা সেবা ভালো লেগেছে?"],
    review_p: [
      "A kind word means the world to a small family nursery. If we've helped bring a little green into your home, we'd be grateful for a quick Google review.",
      "একটি ছোট পারিবারিক নার্সারির কাছে আপনার দু-চার কথা অনেক বড়। আপনার ঘরে একটুকরো সবুজ পৌঁছে দিতে পেরে থাকলে, গুগলে একটা ছোট্ট রিভিউ দিলে কৃতজ্ঞ থাকব।"
    ],

    // ---- Footer ----
    foot_tagline: ["A unit of Shefali Nursery. Grown in Bengal, delivered across India.", "শেফালি নার্সারির একটি অংশ। বাংলায় বেড়ে ওঠা, সারা ভারতে পৌঁছে দেওয়া।"],
    foot_shop: ["Shop Plants", "গাছ কিনুন"],
    foot_help: ["Help", "সহায়তা"],
    foot_reach: ["Reach Us", "যোগাযোগ"],
    foot_ship: ["Shipping & Delivery", "শিপিং ও ডেলিভারি"],
    foot_browse: ["Browse Inventory", "সংগ্রহ দেখুন"],
    foot_rights: ["© 2026 The Sapling Co. · thesaplingco.in · All rights reserved", "© ২০২৬ দ্য স্যাপলিং কো. · thesaplingco.in · সর্বস্বত্ব সংরক্ষিত"],

    // ---- Page heroes ----
    about_h1: ["Rooted in Bengal", "বাংলার মাটিতে শিকড়"],
    about_sub: ["Grown by hand · Delivered with love", "হাতে গড়া · ভালোবেসে পৌঁছে দেওয়া"],
    inv_h1: ["Explore what we grow", "দেখুন আমরা কী ফলাই"],
    inv_p: [
      "From everyday favourites to rare collector's plants, our nursery in Uttarpara is home to a wide and ever-growing collection. Click into a category to browse the full list — and if you don't see exactly what you're looking for, request it. We probably have it, or can grow it for you.",
      "রোজকার প্রিয় গাছ থেকে সংগ্রাহকের দুর্লভ গাছ — উত্তরপাড়ার আমাদের নার্সারিতে রয়েছে বিশাল ও ক্রমবর্ধমান এক সংগ্রহ। যেকোনো বিভাগে ঢুকে পুরো তালিকা দেখুন — আর ঠিক যা খুঁজছেন তা না পেলে বলুন; সম্ভবত আমাদের কাছে আছে, বা আপনার জন্য জোগাড় করে দিতে পারি।"
    ],
    inv_cant_h: ["Can't find it?", "খুঁজে পাচ্ছেন না?"],
    inv_cant_p: ["We grow far more than we can list. Tell us what you're after and we'll track it down.", "তালিকায় যা আছে, তার চেয়ে অনেক বেশি গাছ আমরা ফলাই। কী চাই বলুন, খুঁজে বের করে দেব।"],
    care_h1: ["Plant care, made simple", "গাছের যত্ন, সহজ করে"],
    care_sub: ["Practical, jargon-free advice from people who actually grow these plants. Search a topic or filter by category.", "যারা সত্যিই এই গাছ ফলায়, তাদের সহজ, ঝরঝরে পরামর্শ। বিষয় খুঁজুন বা বিভাগ বেছে নিন।"],
    contact_h1: ["Get in touch", "যোগাযোগ করুন"],
    contact_sub: ["Questions about a plant or your order? We're here to help.", "গাছ বা অর্ডার নিয়ে প্রশ্ন? আমরা আছি পাশে।"],
    contact_form_title: ["Send us a message", "আমাদের একটি বার্তা পাঠান"],
    contact_form_sub: ["Send us a message and we'll get back to you within 24 hours.", "একটি বার্তা পাঠান, ২৪ ঘণ্টার মধ্যে আমরা যোগাযোগ করব।"],
    ship_h1: ["Shipping & Delivery", "শিপিং ও ডেলিভারি"],
    ship_sub: ["We want your plants to arrive as healthy as the day they left our nursery. Here's exactly how we pack and ship every order.", "নার্সারি থেকে বেরোনোর দিনের মতোই সুস্থ অবস্থায় আপনার গাছ পৌঁছক — এটাই চাই। প্রতিটি অর্ডার কীভাবে প্যাক করে পাঠাই, রইল তার বিস্তারিত।"],

    // ---- Category page shared ----
    cta_like_h: ["See something you like?", "পছন্দ হয়েছে কিছু?"],
    cta_like_p: ["There's no online cart yet — just send a quick request and we'll confirm availability, price and delivery by phone or email.", "এখনো অনলাইন কার্ট নেই — ছোট্ট একটা অনুরোধ পাঠান, ফোন বা ইমেলে জানিয়ে দেব গাছ আছে কিনা, দাম আর ডেলিভারি।"],
    care_ask_eyebrow: ["Can't find an answer?", "উত্তর খুঁজে পাচ্ছেন না?"],
    care_ask_title: ["Ask a real grower", "সরাসরি এক চাষিকে জিজ্ঞেস করুন"],
    care_ask_p: ["We're always happy to help with a plant problem or a care question — no purchase needed.", "গাছের সমস্যা বা যত্নের প্রশ্নে আমরা সবসময় সাহায্যে রাজি — কিছু কিনতে হবে না।"],

    // ---- About (body) ----
    about_story_title: ["Every home deserves a living, breathing plant", "প্রতিটা ঘরেই থাকুক একটা জীবন্ত, প্রাণভরা গাছ"],
    about_p3: ["At The Sapling Co., we believe trees are the reason we live. Our mission is to bring that life — one plant at a time — into every Indian home.", "The Sapling Co.-তে আমরা বিশ্বাস করি, গাছ আছে বলেই আমরা আছি। আমাদের একটাই mission — একটা একটা করে গাছ পৌঁছে দিয়ে ভারতের প্রতিটা ঘরে সেই প্রাণটুকু নিয়ে আসা।"],
    about_p4: ["The Sapling Co. is the customer-facing name of Shefali Nursery, a registered proprietorship (Udyam Reg. No. UDYAM-WB-07-0131188) run by Shankar Mitra — a genuine, hands-on nursery, not a reseller or a dropshipper.", "The Sapling Co. আসলে Shefali Nursery-র brand নাম — একটি registered proprietorship (Udyam Reg. No. UDYAM-WB-07-0131188), চালান শঙ্কর মিত্র। এটা সত্যিকারের হাতে-গড়া নার্সারি, কোনো reseller বা dropshipper নয়।"],
    inv_cat_word: ["Plant categories", "গাছের বিভাগ"],
    journey_eyebrow: ["From our soil to your home", "আমাদের মাটি থেকে আপনার ঘরে"],
    journey_title: ["How your plant reaches you", "আপনার গাছ কীভাবে পৌঁছয়"],
    step1_t: ["Grown", "যত্নে গড়া"], step1_p: ["Nurtured by hand in our Uttarpara nursery.", "আমাদের উত্তরপাড়া নার্সারিতে হাতে হাতে বড় করা।"],
    step2_t: ["Packed", "প্যাক করা"], step2_p: ["Wrapped in coco peat and a cushioned box.", "কোকো পিট আর cushioned box-এ মুড়ে।"],
    step3_t: ["Shipped", "পাঠানো"], step3_p: ["Sent via trusted couriers, arriving in 4–6 days.", "বিশ্বস্ত courier-এ, ৪–৬ দিনে পৌঁছয়।"],
    step4_t: ["Thrives", "বেড়ে ওঠা"], step4_p: ["Settles into your home with a printed care card.", "একটা printed care card সহ আপনার ঘরে থিতু হয়।"],
    about_spec_title: ["A specialty in indoor foliage", "বিশেষত্ব — ইনডোর পাতাবাহার"],
    about_cta_h: ["Trees are the reason we live.", "গাছ আছে বলেই আমরা আছি।"],
    about_cta_p: ["Bring that life into your home, one plant at a time.", "একটা একটা করে গাছ, আপনার ঘরে আসুক সেই প্রাণ।"],

    // ---- Shipping (body) ----
    ship_pack_h: ["How we pack", "কীভাবে প্যাক করি"],
    ship_pack_p: ["Live plants are delicate, so we don't cut corners. Every plant is:", "জীবন্ত গাছ বড় নাজুক, তাই আমরা কোনো shortcut নিই না। প্রতিটা গাছ:"],
    ship_pack_1: ["Secured at the root with moist coco peat to retain moisture in transit", "শিকড়ে ভেজা কোকো পিট দিয়ে বাঁধা, যাতে রাস্তায় moisture ধরে থাকে"],
    ship_pack_2: ["Wrapped in newspaper cushioning to protect leaves and stems", "পাতা আর ডাল বাঁচাতে খবরের কাগজের cushioning-এ মোড়া"],
    ship_pack_3: ["Boxed in a sturdy corrugated carton, clearly marked as a live plant", "মজবুত corrugated box-এ, স্পষ্ট করে ‘live plant’ লেখা"],
    ship_local_h: ["Local home delivery", "লোকাল হোম ডেলিভারি"],
    ship_local_p: ["Around our Uttarpara nursery we currently offer local home delivery at simple, honest rates (added to your order):", "উত্তরপাড়া নার্সারির আশপাশে আমরা এখন সহজ, সৎ rate-এ লোকাল হোম ডেলিভারি দিই (অর্ডারের সঙ্গে যোগ হয়):"],
    ship_time_h: ["Delivery time", "ডেলিভারির সময়"],
    ship_time_p: ["Once pan-India shipping launches:", "সারা ভারতে shipping চালু হলে:"],
    ship_time_1: ["Orders are dispatched within 1–2 business days of confirmation", "confirm হওয়ার ১–২ business day-র মধ্যে order dispatch হয়"],
    ship_time_2: ["Delivery typically takes 4–6 business days depending on your location", "location অনুযায়ী সাধারণত ৪–৬ business day লাগে"],
    ship_time_3: ["Remote PIN codes may take slightly longer", "দূরের PIN code-এ একটু বেশি সময় লাগতে পারে"],
    ship_ship_h: ["When your order ships", "order পাঠানোর পর"],
    ship_ship_p: ["You'll receive a confirmation with tracking details once your plant is on its way. You can also reach us anytime on WhatsApp for an update.", "গাছ রওনা হলেই tracking details সহ একটা confirmation পাবেন। update চাইলে যেকোনো সময় WhatsApp করুন।"],
    ship_dmg_h: ["If your plant arrives damaged", "গাছ যদি damaged অবস্থায় পৌঁছয়"],
    ship_dmg_p: ["We pack carefully, but transit can occasionally be rough. If your plant arrives damaged, message us within 48 hours of delivery with photos of the plant and packaging, and we'll make it right. Please keep the original packaging until the issue is resolved.", "আমরা যত্ন করেই প্যাক করি, তবু transit-এ মাঝেমধ্যে ধকল যায়। গাছ damaged হয়ে পৌঁছলে delivery-র ৪৮ ঘণ্টার মধ্যে গাছ আর packaging-এর photo সহ আমাদের message করুন — আমরা ঠিক করে দেব। সমস্যা না মেটা পর্যন্ত original packaging-টা রেখে দেবেন।"],
    ship_area_h: ["Delivery areas", "ডেলিভারি এলাকা"],
    ship_area_p: ["We currently ship across India. Some live plants may be restricted from certain regions due to agricultural or courier rules — if that affects your order, we'll contact you.", "আমরা এখন সারা ভারতে পাঠাই। agricultural বা courier নিয়মের কারণে কিছু live plant কোনো কোনো অঞ্চলে যেতে না-ও পারে — তেমন হলে আমরা আপনাকে জানিয়ে দেব।"],
    ship_q_h: ["Questions about an order?", "order নিয়ে কোনো প্রশ্ন?"],
    ship_q_p: ["We're happy to help with packing, timing or delivery to your area.", "packing, timing বা আপনার এলাকায় delivery — যেকোনো বিষয়ে সাহায্য করতে আমরা আছি।"],

    // ---- Care guides (body) ----
    pill_all: ["All", "সব"], pill_indoor: ["Indoor", "ইনডোর"], pill_fruit: ["Fruit", "ফল"], pill_flowering: ["Flowering", "ফুল"], pill_trouble: ["Troubleshooting", "সমস্যা সমাধান"],
    care_search_ph: ["Search guides — e.g. yellow leaves, money plant…", "গাইড খুঁজুন — যেমন হলুদ পাতা, money plant…"],
    g_feat_cat: ["Featured · Indoor", "ফিচার্ড · ইনডোর"],
    g1_t: ["The complete Money Plant care guide", "Money Plant-এর সম্পূর্ণ care guide"],
    g1_p: ["Light, watering, propagation and the common mistakes that hold this easy, air-purifying plant back — everything you need to keep your Money Plant lush and trailing.", "আলো, জল, propagation আর যে ছোট ভুলগুলো এই সহজ air-purifying গাছটাকে আটকে রাখে — Money Plant-কে ঝলমলে আর লতানো রাখতে যা যা দরকার, সব এখানে।"],
    g2_t: ["Why are my plant's leaves turning yellow?", "গাছের পাতা হলুদ হয়ে যাচ্ছে কেন?"],
    g2_p: ["The #1 plant problem, decoded — overwatering, light and how to bring leaves back.", "গাছের ১ নম্বর সমস্যা, সহজ করে — বেশি জল, আলো, আর পাতা ফিরিয়ে আনার উপায়।"],
    g3_t: ["Growing Miyazaki Mango in a container", "টবেই Miyazaki Mango ফলানো"],
    g3_p: ["How to grow the world's most prized mango on a terrace or balcony.", "দুনিয়ার সবচেয়ে দামি আমটা ছাদে বা balcony-তেই কীভাবে ফলাবেন।"],
    g4_t: ["Make your Hibiscus bloom all season", "সারা মরসুম জবা ফোটান"],
    g4_p: ["Feeding, pruning and light tricks to keep those big tropical blooms coming.", "খাবার, pruning আর আলোর ছোট্ট কিছু কৌশল — বড় বড় ফুল যাতে ফুটতেই থাকে।"],
    g5_t: ["Best low-maintenance indoor plants for Indian homes", "ভারতীয় ঘরের জন্য সেরা low-maintenance ইনডোর গাছ"],
    g5_p: ["The toughest, prettiest plants for busy homes and low-light corners.", "ব্যস্ত ঘর আর কম-আলোর কোণের জন্য সবচেয়ে শক্তপোক্ত, সুন্দর গাছ।"],
    g6_t: ["How to keep plants alive while travelling", "travel-এ থাকাকালীন গাছ বাঁচিয়ে রাখবেন কীভাবে"],
    g6_p: ["Simple ways to keep plants happy while you're away for days or weeks.", "কয়েক দিন বা সপ্তাহ বাইরে থাকলেও গাছ ভালো রাখার সহজ উপায়।"],
    care_empty: ["No guides match that search yet — try a different word, or <a href=\"contact.html\" style=\"color:var(--accent);font-weight:600\">ask us directly</a>.", "এই search-এ এখনো কোনো গাইড মিলল না — অন্য একটা শব্দ লিখে দেখুন, বা <a href=\"contact.html\" style=\"color:var(--accent);font-weight:600\">সরাসরি আমাদের জিজ্ঞেস করুন</a>।"],

    // ---- Contact methods ----
    cm_wa_t: ["WhatsApp us", "WhatsApp করুন"], cm_wa_p: ["Fastest reply · 10 am – 7 pm", "দ্রুততম উত্তর · সকাল ১০টা – সন্ধ্যা ৭টা"],
    cm_em_t: ["Email", "ইমেল"], cm_em_p: ["We reply within 24 hours", "২৪ ঘণ্টার মধ্যে উত্তর দিই"],
    cm_ig_t: ["Instagram", "ইনস্টাগ্রাম"], cm_ig_p: ["Follow for plant care & new arrivals", "গাছের যত্ন আর নতুন গাছের খবরে follow করুন"],
    cm_ns_t: ["Our nursery", "আমাদের নার্সারি"],

    // ---- Category pages ----
    lbl_varieties: ["varieties", "রকম"],
    lbl_next: ["Next:", "এরপর:"],
    cat_fruit_lead: ["Our fruit collection leans on premium grafted saplings chosen to fruit reliably — even in containers on a terrace or balcony. From the world-famous Miyazaki mango to Bengal's beloved Gondhoraj lemon, here's what's growing now.", "আমাদের ফলের সংগ্রহের ভরসা premium কলমের চারা — টবে, ছাদে বা balcony-তেও নিশ্চিন্তে ফল ধরে। দুনিয়া-বিখ্যাত Miyazaki আম থেকে বাংলার প্রিয় গন্ধরাজ লেবু — এখন যা যা আছে, দেখে নিন।"],
    cat_palm_lead: ["Palms bring instant tropical calm to a balcony, courtyard or living room. We grow classic indoor palms alongside a spread of coconut varieties, from compact dwarfs to tall growers.", "পাম মানেই balcony, উঠোন বা বসার ঘরে এক ঝলক tropical প্রশান্তি। classic ইনডোর পাম-এর পাশাপাশি আমরা রাখি নানা রকম নারকেল — ছোট dwarf থেকে লম্বা গাছ পর্যন্ত।"],
    cat_flower_lead: ["For colour that comes back season after season. Our flowering range is unusually wide — including rare hibiscus and rose colours you won't easily find elsewhere.", "যে রং ফিরে ফিরে আসে, মরসুমের পর মরসুম। আমাদের ফুলের range বেশ বড় — এমন কিছু দুর্লভ জবা আর গোলাপের রং, যা সহজে আর কোথাও মিলবে না।"],
    cat_orn_lead: ["Not every plant needs flowers to make a statement. These hardy, coloured-leaf plants bring texture and year-round colour to gardens, borders and bright interiors.", "সব গাছের নজর কাড়তে ফুল লাগে না। এই শক্তপোক্ত, রঙিন-পাতার গাছগুলো বাগান, border আর আলোভরা ঘরে সারা বছর texture আর রং এনে দেয়।"],
    cat_indoor_lead: ["This is our specialty. Easy-care, air-purifying foliage for living rooms, desks and low-light corners — including the patterned Aglaonemas and near-indestructible ZZ Plants that collectors love.", "এটাই আমাদের specialty। বসার ঘর, desk আর কম-আলোর কোণের জন্য সহজ-যত্নের, air-purifying পাতাবাহার — সংগ্রাহকদের প্রিয় নকশা-পাতা Aglaonema আর প্রায়-অবিনশ্বর ZZ Plant সহ।"],
    cat_succ_lead: ["Low-fuss, high-character plants for sunny windowsills and desks. Our range spans neat rosette succulents to a genuinely wide cactus collection.", "রোদভরা জানালা আর desk-এর জন্য কম-ঝামেলার, দারুণ চরিত্রের গাছ। ছিমছাম rosette succulent থেকে সত্যিই বড় এক cactus সংগ্রহ পর্যন্ত।"],
    cat_land_lead: ["For gardens, borders and larger planting projects. Hardy, good-looking plants that fill space quickly and stand up to the Bengal climate.", "বাগান, border আর বড় planting project-এর জন্য। শক্তপোক্ত, দেখতে সুন্দর গাছ — দ্রুত জায়গা ভরায় আর বাংলার আবহাওয়ায় দিব্যি টিকে থাকে।"]
  };

  function ensureBnFonts() {
    if (document.getElementById("bn-fonts")) return;
    var l = document.createElement("link");
    l.id = "bn-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(l);
  }

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function current() {
    return document.documentElement.getAttribute("lang") === "bn" ? "bn" : "en";
  }

  function t(key, lang) {
    var e = DICT[key];
    if (!e) return "";
    return e[(lang || current()) === "bn" ? 1 : 0];
  }

  function apply(lang, root) {
    lang = lang === "bn" ? "bn" : "en";
    var i = lang === "bn" ? 1 : 0;
    var scope = root || document;
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.classList.toggle("lang-bn", lang === "bn");
    html.classList.toggle("lang-en", lang === "en");
    if (lang === "bn") ensureBnFonts();

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var e = DICT[el.getAttribute("data-i18n")];
      if (e) el.textContent = e[i];
    });
    scope.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var e = DICT[el.getAttribute("data-i18n-html")];
      if (e) el.innerHTML = e[i];
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var e = DICT[el.getAttribute("data-i18n-ph")];
      if (e) el.setAttribute("placeholder", e[i]);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var e = DICT[el.getAttribute("data-i18n-aria")];
      if (e) el.setAttribute("aria-label", e[i]);
    });

    // reflect language selector state
    document.querySelectorAll("[data-lang-label]").forEach(function (el) {
      el.textContent = lang === "bn" ? "বাংলা" : "EN";
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  function initialLang() {
    var s = stored();
    if (s === "bn" || s === "en") return s;
    return "en";
  }

  window.SaplingI18n = { DICT: DICT, t: t, apply: apply, current: current, initialLang: initialLang };
})();
