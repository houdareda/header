<?php 
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        "cookie_httponly" => true,
        "cookie_secure" => true,
        "use_strict_mode" => true,
    ]);
}

define("DB_HOST", "localhost");
define("DB_USER", "uasq8vdqrv6cu");
define("DB_PASS", "qz4acomrdzbc");
define("DB_NAME", "dbbpgrhuxkvoll");

function get_db_connection() {
    static $con = null;
    if ($con === null) {
        $con = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if (!$con) {
            error_log("Database connection failed: " . mysqli_connect_error());
            echo "We're experiencing technical difficulties. Please try again later.";
            exit();
        }
        mysqli_set_charset($con, "utf8mb4");
    }
    return $con;
}

function get_current_page_info() {
    $current_page = basename($_SERVER["PHP_SELF"]);
    $current_page_without_ext = str_replace(".php", "", $current_page);
    $current_page_without_lang = preg_replace('/_([a-z]{2})$/', "", $current_page_without_ext);
    $current_lang = "en";
    $langs = ["fr", "it", "tr", "pl", "es", "ru", "ar", "nl", "ro"];
    foreach ($langs as $l) {
        if (strpos($current_page, "_$l") !== false) {
            $current_lang = $l;
            break;
        }
    }
    return [
        "current_page" => $current_page,
        "current_page_without_lang" => $current_page_without_lang,
        "current_lang" => $current_lang,
    ];
}

function get_header_settings() {
    static $cached_settings = null;
    if ($cached_settings !== null) {
        return $cached_settings;
    }
    $con = get_db_connection();
    $result = mysqli_query($con, "SELECT * FROM header_settings WHERE id = 1");
    $cached_settings = ($result && mysqli_num_rows($result) > 0) ? mysqli_fetch_assoc($result) : [];
    return $cached_settings;
}

function get_language_url($base_url, $lang_suffix) {
    $con = get_db_connection();
    $query_params = $_GET;
    $tour_param = null;
    $possible_tour_params = ["tour", "tour_de", "tour_fr", "tour_it", "tour_tr", "tour_pl", "tour_es", "tour_ro"];
    
    foreach ($possible_tour_params as $param) {
        if (isset($_GET[$param])) {
            $tour_param = $_GET[$param];
            break;
        }
    }
    
    if (!$tour_param && isset($_GET["slug"])) {
        $tour_param = $_GET["slug"];
    }
    
    $product_id = isset($_GET["id"]) ? $_GET["id"] : null;
    $language_specific_url = null;
    
    if ($tour_param || $product_id) {
        $url_column_map = [
            "en" => "url_tour", "de" => "url_tour_de", "es" => "url_tour_es",
            "nl" => "url_tour", "fr" => "url_tour_fr", "it" => "url_tour_it",
            "tr" => "url_tour_tr", "pl" => "url_tour_pl", "ro" => "url_tour_ro",
            "ru" => "url_tour", "ar" => "url_tour", "zh" => "url_tour", "hi" => "url_tour",
        ];
        
        $target_url_column = isset($url_column_map[$lang_suffix]) ? $url_column_map[$lang_suffix] : "url_tour";
        
        if ($product_id) {
            $query = "SELECT {$target_url_column} as target_url, product_id FROM products WHERE product_id = ? LIMIT 1";
            if ($stmt = mysqli_prepare($con, $query)) {
                mysqli_stmt_bind_param($stmt, "s", $product_id);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                if ($row = mysqli_fetch_assoc($result)) {
                    $language_specific_url = $row["target_url"];
                    $product_id = $row["product_id"];
                }
                mysqli_stmt_close($stmt);
            }
        } elseif ($tour_param) {
            $search_columns = ["url_tour", "url_tour_de", "url_tour_es", "url_tour_fr", "url_tour_it", "url_tour_tr", "url_tour_pl", "url_tour_ro"];
            foreach ($search_columns as $search_col) {
                $query = "SELECT {$target_url_column} as target_url, product_id FROM products WHERE {$search_col} = ? LIMIT 1";
                if ($stmt = mysqli_prepare($con, $query)) {
                    mysqli_stmt_bind_param($stmt, "s", $tour_param);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    if ($row = mysqli_fetch_assoc($result)) {
                        $language_specific_url = $row["target_url"];
                        $product_id = $row["product_id"];
                        break;
                    }
                    mysqli_stmt_close($stmt);
                }
            }
        }
    }
    
    $clean_base_url = str_replace(".php", "", $base_url);
    $url = $lang_suffix === "en" ? $clean_base_url : $clean_base_url . "_{$lang_suffix}";
    
    foreach ($possible_tour_params as $p) {
        unset($query_params[$p]);
    }
    unset($query_params["id"]);
    unset($query_params["slug"]);
    
    $param_name_map = [
        "en" => "tour", "de" => "tour_de", "es" => "tour_es", "nl" => "tour",
        "fr" => "tour_fr", "it" => "tour_it", "tr" => "tour_tr", "pl" => "tour_pl",
        "ro" => "tour_ro", "ru" => "tour", "ar" => "tour", "zh" => "tour", "hi" => "tour",
    ];
    
    $param_name = isset($param_name_map[$lang_suffix]) ? $param_name_map[$lang_suffix] : "tour";
    
    if ($language_specific_url && !empty($language_specific_url)) {
        $query_params[$param_name] = $language_specific_url;
    } elseif ($product_id) {
        $query_params["id"] = $product_id;
    } elseif ($tour_param) {
        $query_params[$param_name] = $tour_param;
    }
    
    $query_string = !empty($query_params) ? "?" . http_build_query($query_params) : "";
    return $url . $query_string;
}

$page_info = get_current_page_info();
$current_page = $page_info["current_page"];
$current_page_without_lang = $page_info["current_page_without_lang"];
$current_language = $page_info["current_lang"];
$header_settings = get_header_settings();

$destinations = [
    "sharm-el-sheikh" => ["icon" => "fas fa-umbrella-beach", "class" => "icon-sharm", "name" => "Sharm El-Sheikh"],
    "hurghada" => ["icon" => "fas fa-water", "class" => "icon-hurghada", "name" => "Hurghada"],
    "cairo" => ["icon" => "fas fa-landmark", "class" => "icon-cairo", "name" => "Cairo"],
    "luxor" => ["icon" => "fas fa-monument", "class" => "icon-luxor", "name" => "Luxor"],
    "marsa-alam" => ["icon" => "fas fa-fish", "class" => "icon-marsa", "name" => "Marsa Alam"],
    "el-gouna" => ["icon" => "fas fa-hotel", "class" => "icon-gouna", "name" => "El Gouna"],
    "makadi" => ["icon" => "fas fa-water", "class" => "icon-makadi", "name" => "Makadi Bay"],
    "safaga" => ["icon" => "fas fa-ship", "class" => "icon-safaga", "name" => "Safaga"],
    "sahl-hasheesh" => ["icon" => "fas fa-umbrella-beach", "class" => "icon-sahl", "name" => "Sahl Hasheesh"],
    "soma-bay" => ["icon" => "fas fa-swimming-pool", "class" => "icon-soma", "name" => "Soma Bay"],
];

$categories = [
    "historical" => ["icon" => "fas fa-landmark", "name" => "Historical Tours"],
    "boat-tour" => ["icon" => "fas fa-ship", "name" => "Boat Tours"],
    "safari" => ["icon" => "fas fa-truck-monster", "name" => "Safari Tours"],
    "watersports" => ["icon" => "fas fa-water", "name" => "Water Sports"],
    "multi-day" => ["icon" => "fas fa-calendar-alt", "name" => "Multi-Day Tours"],
];

$guides = [
    "hurghada_guide" => ["icon" => "fas fa-umbrella-beach icon-hurghada", "name" => "Hurghada Guide"],
    "sharm_guide" => ["icon" => "fas fa-water icon-sharm", "name" => "Sharm El-Sheikh Guide"],
    "cairo_guide" => ["icon" => "fas fa-landmark icon-cairo", "name" => "Cairo Guide"],
    "luxor_guide" => ["icon" => "fas fa-monument icon-luxor", "name" => "Luxor Guide"],
    "marsa_alam_guide" => ["icon" => "fas fa-fish icon-marsa", "name" => "Marsa Alam Guide"],
];

$languages = [
    "en" => ["name" => "English", "flag" => "gb"],
    "de" => ["name" => "Deutsch", "flag" => "de"],
    "fr" => ["name" => "Français", "flag" => "fr"],
    "it" => ["name" => "Italiano", "flag" => "it"],
    "nl" => ["name" => "Nederlands", "flag" => "nl"],
    "es" => ["name" => "Español", "flag" => "es"],
    "pl" => ["name" => "Polski", "flag" => "pl"],
    "tr" => ["name" => "Türkçe", "flag" => "tr"],
    "ro" => ["name" => "Română", "flag" => "ro"],
    "ru" => ["name" => "Русский", "flag" => "ru"],
    "ar" => ["name" => "العربية", "flag" => "sa"],
    "zh" => ["name" => "Chinese", "flag" => "cn"],
    "hi" => ["name" => "Hindi", "flag" => "in"],
];

$css_version = @filemtime(__DIR__ . "/css/siteheadertest.css") ?: time();
$js_version_siteheader = @filemtime(__DIR__ . "/js/siteheadertest.js") ?: time();
$js_version_currency = @filemtime(__DIR__ . "/js/currency-manager.js") ?: time();
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($current_language); ?>">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://stackpath.bootstrapcdn.com">
    <link rel="dns-prefetch" href="https://stackpath.bootstrapcdn.com">
    <link rel="preconnect" href="https://flagicons.lipis.dev">
    <link rel="dns-prefetch" href="https://flagicons.lipis.dev">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="/css/siteheadertest.css?v=<?php echo $css_version; ?>">
    
</head>

<body>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg navbar-light bg-white">
            <div class="container">
                <a class="navbar-brand" href="/">
                    <?php if (!empty($header_settings["logo_path" ])): ?>
                    <img src="<?php echo htmlspecialchars($header_settings["logo_path"]); ?>"
                        alt="<?php echo htmlspecialchars($header_settings["logo_alt"] ?? "Egyptra Travel Services"); ?>"
                        class="brand-logo" width="auto" height="50" loading="lazy" decoding="async" fetchpriority="low">
                    <?php else: ?>
                    <i class="fas fa-pyramid text-primary mr-2"></i>
                    <span class="brand-text font-weight-bold">Egyptra Travel Services</span>
                    <?php endif; ?>
                </a>

                <div class="mobile-actions d-lg-none">
                    <button class="mobile-search-button" aria-label="Search" id="mobileSearchButton">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="mobile-currency-button" aria-label="Change Currency" id="mobileCurrencyButton">
                        <span class="currency-icon">€</span>
                    </button>
                    <a href="/shopping-cart" class="mobile-cart-button" aria-label="Shopping Cart">
                        <i class="fas fa-cart-plus"></i>
                        <span class="cart-count" id="mobileCartCount">0</span>
                    </a>
                    <button class="navbar-toggler mobile-menu-button" type="button" aria-controls="navbarMain"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <i class="fas fa-bars" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="collapse navbar-collapse" id="navbarMain">
                    <!-- Main Navigation Links (Desktop & Mobile) -->
                    <ul class="navbar-nav nav_links mx-auto align-items-center">
                        <!-- Destinations -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" aria-expanded="false">
                                <i class="fas fa-globe-africa"></i>
                                <span class="ml-2">Destinations</span>
                            </a>
                            <div class="dropdown-menu dropdown-menu-destinations">
                                <div class="dropdown-items-grid">
                                    <?php foreach ($destinations as $dest_slug => $dest_data): ?>
                                    <a class="dropdown-item"
                                        href="/destination_tours?location=<?php echo $dest_slug; ?>">
                                        <i
                                            class="<?php echo $dest_data["icon"]; ?> <?php echo $dest_data["class"]; ?>"></i>
                                        <?php echo $dest_data["name"]; ?>
                                    </a>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </li>

                        <!-- Categories -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="/category" role="button" aria-expanded="false">
                                <i class="fas fa-th-list"></i>
                                <span class="ml-2">Tour Category</span>
                            </a>
                            <div class="dropdown-menu">
                                <?php foreach ($categories as $cat_slug => $cat_data): ?>
                                <a class="dropdown-item" href="/category_products?category=<?php echo $cat_slug; ?>">
                                    <i class="<?php echo $cat_data["icon"]; ?>"></i>
                                    <span class="ml-2"><?php echo $cat_data["name"]; ?></span>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </li>

                        <!-- Travel Guide -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle guide-link" href="/travel-guide" role="button">
                                <i class="fas fa-map-marked-alt guide-icon"></i>
                                <span class="ml-2">Travel Guide</span>
                            </a>
                            <div class="dropdown-menu">
                                <?php foreach ($guides as $guide_slug => $guide_data): ?>
                                <a class="dropdown-item guide-item" href="/<?php echo $guide_slug; ?>">
                                    <i class="<?php echo $guide_data["icon"]; ?>"></i>
                                    <span><?php echo $guide_data["name"]; ?></span>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </li>

                        <!-- Contact -->
                        <li class="nav-item">
                            <a class="nav-link" href="/contact_us">
                                <i class="fas fa-envelope"></i>
                                <span class="ml-2">Contact</span>
                            </a>
                        </li>

                        <!-- Why Us -->
                        <li class="nav-item">
                            <a class="nav-link" href="https://egyptra.pro/why_us">
                                <i class="fas fa-award"></i>
                                <span class="ml-2">Why Us</span>
                            </a>
                        </li>

                        <!-- Login (Mobile Only - Inside Menu) -->
                        <li class="nav-item d-lg-none">
                            <a class="nav-link" href="/customer_login">
                                <i class="far fa-user"></i>
                                <span class="ml-2">Login</span>
                            </a>
                        </li>

                        <!-- Language Selector (Mobile Only - Inside Menu) -->
                        <li class="nav-item dropdown lang-selector d-lg-none">
                            <a class="nav-link dropdown-toggle" href="#" role="button" aria-expanded="false">
                                <i class="fas fa-language"></i>
                                <span class="ml-2">Language</span>
                            </a>
                            <div class="dropdown-menu lang-menu">
                                <?php foreach ($languages as $lang_code => $lang_data):
                                    $base_page = $current_page_without_lang;
                                    if (strpos($current_page, "contact_us") !== false) {
                                        $base_page = "contact_us";
                                    }
                                    $lang_url = get_language_url($base_page, $lang_code);
                                    $is_active = $current_language === $lang_code;
                                ?>
                                <a class="dropdown-item lang-item lang-<?php echo $lang_code; ?> <?php echo $is_active ? "active" : ""; ?>"
                                    href="<?php echo htmlspecialchars($lang_url); ?>">
                                    <img src="https://flagicons.lipis.dev/flags/4x3/<?php echo $lang_data["flag"]; ?>.svg"
                                        alt="<?php echo $lang_data["name"]; ?>" width="20" height="15">
                                    <?php echo $lang_data["name"]; ?>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </li>
                    </ul>

                    <!-- Right Side Icons (Desktop Only) -->
                    <ul class="navbar-nav nav_icons ml-auto align-items-center d-none d-lg-flex">
                        <!-- Language Selector (Desktop Only) -->
                        <li class="nav-item dropdown lang-selector">
                            <a class="nav-link dropdown-toggle" href="#" role="button" aria-expanded="false">
                                <img src="https://flagicons.lipis.dev/flags/4x3/<?php echo $current_language === "en" ? "gb" : $current_language; ?>.svg"
                                    alt="<?php echo strtoupper($current_language); ?>" width="20" height="15">
                            </a>
                            <div class="dropdown-menu lang-menu">
                                <?php foreach ($languages as $lang_code => $lang_data):
                                    $base_page = $current_page_without_lang;
                                    if (strpos($current_page, "contact_us") !== false) {
                                        $base_page = "contact_us";
                                    }
                                    $lang_url = get_language_url($base_page, $lang_code);
                                    $is_active = $current_language === $lang_code;
                                ?>
                                <a class="dropdown-item lang-item lang-<?php echo $lang_code; ?> <?php echo $is_active ? "active" : ""; ?>"
                                    href="<?php echo htmlspecialchars($lang_url); ?>">
                                    <img src="https://flagicons.lipis.dev/flags/4x3/<?php echo $lang_data["flag"]; ?>.svg"
                                        alt="<?php echo $lang_data["name"]; ?>" width="20" height="15">
                                    <?php echo $lang_data["name"]; ?>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </li>
                        <!-- Currency Selector (Desktop Only) -->
                        <li class="nav-item dropdown currency-selector desktop-currency">
                            <a class="nav-link dropdown-toggle currency-toggle" href="#" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="currency-symbol">€</span>
                            </a>
                            <div class="dropdown-menu currency-menu">
                                <a class="dropdown-item currency-item currency-eur active" href="#" data-currency="EUR"
                                    data-rate="1" data-symbol="€">
                                    <span class="currency-flag">€</span> EUR - Euro
                                </a>
                                <a class="dropdown-item currency-item currency-gbp" href="#" data-currency="GBP"
                                    data-rate="0.87" data-symbol="£">
                                    <span class="currency-flag">£</span> GBP - British Pound
                                </a>
                                <a class="dropdown-item currency-item currency-usd" href="#" data-currency="USD"
                                    data-rate="1.16" data-symbol="$">
                                    <span class="currency-flag">$</span> USD - US Dollar
                                </a>
                                <a class="dropdown-item currency-item currency-egp" href="#" data-currency="EGP"
                                    data-rate="56.03" data-symbol="EGP">
                                    <span class="currency-flag">ج.م</span> EGP - Egyptian Pound
                                </a>
                            </div>
                        </li>

                        <!-- User Account (Desktop Only) -->
                        <li class="nav-item">
                            <a class="nav-link nav_icon" href="/customer_login">
                                <i class="far fa-user"></i>
                            </a>
                        </li>

                        <!-- Shopping Cart (Desktop Only) -->
                        <li class="nav-item">
                            <a class="nav-link nav_icon" href="/shopping-cart">
                                <i class="fas fa-cart-plus"></i>
                                <span class="cart-count" id="cartCount">0</span>
                            </a>
                        </li>

                        <!-- Search (Desktop Only) -->
                        <li class="nav-item header-search-container">
                            <button class="btn btn-primary search-trigger" id="searchTrigger" aria-expanded="false">
                                <i class="fas fa-search"></i>
                            </button>
                            <div class="search-dropdown" id="searchDropdown">
                                <form action="/all_products" method="GET" class="search-form" id="searchForm">
                                    <div class="input-group search-input-wrapper">
                                        <input type="text" class="form-control search-input" name="search"
                                            id="searchInput" autocomplete="off"
                                            placeholder="Search activities, tours, or destinations...">
                                        <div class="input-group-append">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                        <div class="search-clear-btn" id="searchClearBtn" style="display:none;">
                                            <i class="fas fa-times"></i>
                                        </div>
                                    </div>
                                    <div id="searchSuggestions" class="search-suggestions" role="listbox"></div>
                                    <div class="quick-links mt-3">
                                        <h6 class="text-muted">Popular Searches</h6>
                                        <div class="quick-search-tags">
                                            <a href="/all_products?search=snorkeling" class="quick-search-tag">
                                                <i class="fas fa-water"></i> Snorkeling
                                            </a>
                                            <a href="/all_products?search=desert+safari" class="quick-search-tag">
                                                <i class="fas fa-truck-monster"></i> Desert Safari
                                            </a>
                                            <a href="/all_products?search=pyramids" class="quick-search-tag">
                                                <i class="fas fa-landmark"></i> Pyramids
                                            </a>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- Mobile Currency Modal -->
        <div class="mobile-currency-modal" id="mobileCurrencyModal">
            <div class="mobile-currency-modal-content">
                <div class="mobile-currency-header">
                    <h5>Select Currency</h5>
                    <button class="close-modal" id="closeCurrencyModal">&times;</button>
                </div>
                <div class="mobile-currency-list">
                    <a class="mobile-currency-item currency-item currency-eur active" href="#" data-currency="EUR"
                        data-rate="1" data-symbol="€">
                        <span class="currency-flag">€</span>
                        <span>EUR - Euro</span>
                    </a>
                    <a class="mobile-currency-item currency-item currency-gbp" href="#" data-currency="GBP"
                        data-rate="0.87" data-symbol="£">
                        <span class="currency-flag">£</span>
                        <span>GBP - British Pound</span>
                    </a>
                    <a class="mobile-currency-item currency-item currency-usd" href="#" data-currency="USD"
                        data-rate="1.16" data-symbol="$">
                        <span class="currency-flag">$</span>
                        <span>USD - US Dollar</span>
                    </a>
                    <a class="mobile-currency-item currency-item currency-egp" href="#" data-currency="EGP"
                        data-rate="56.03" data-symbol="EGP">
                        <span class="currency-flag">ج.م</span>
                        <span>EGP - Egyptian Pound</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Mobile Search Modal -->
        <div class="mobile-search-modal" id="mobileSearchModal">
            <div class="mobile-search-content">
                <div class="mobile-search-header">
                    <h5>Search Tours & Activities</h5>
                    <button class="close-search-modal" id="closeSearchModal">&times;</button>
                </div>
                <form action="/all_products" method="GET" class="mobile-search-form" id="mobileSearchForm">
                    <input type="text" name="search" class="mobile-search-input"
                        placeholder="Search destinations, tours..." id="mobileSearchInput" autocomplete="off">
                    <button type="submit" class="mobile-search-submit">
                        <i class="fas fa-search"></i> Search
                    </button>
                </form>
                <div class="mobile-popular-searches">
                    <h6>Popular Searches</h6>
                    <div class="mobile-search-tags">
                        <a href="/all_products?search=snorkeling" class="mobile-search-tag">Snorkeling</a>
                        <a href="/all_products?search=pyramids" class="mobile-search-tag">Pyramids</a>
                        <a href="/all_products?search=desert+safari" class="mobile-search-tag">Desert Safari</a>
                        <a href="/all_products?search=hurghada" class="mobile-search-tag">Hurghada</a>
                        <a href="/all_products?search=luxor" class="mobile-search-tag">Luxor</a>
                        <a href="/all_products?search=diving" class="mobile-search-tag">Diving</a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <script defer src="/js/siteheadertest.js?v=<?php echo $js_version_siteheader; ?>"></script>
    <script defer src="/js/currency-manager.js?v=<?php echo $js_version_currency; ?>"></script>
</body>

</html>