// Imports.
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Table } from "antd";
import "antd/dist/reset.css";
import styles from "../styles/home.js";
const customBtnStyle = `
.custom-use-btn { padding: 6px 18px; border-radius: 6px; font-weight: 600; font-size: 15px; border: none; transition: background 0.2s, color 0.2s; background: #000; color: #fff; margin: 0 2px; }
.custom-use-btn[disabled], .custom-use-btn:disabled { background: #d3d3d3 !important; color: #666 !important; cursor: not-allowed !important; opacity: 1 !important; }`;
if (typeof document !== 'undefined' && !document.getElementById('custom-use-btn-style')) { const style = document.createElement('style'); style.id = 'custom-use-btn-style'; style.innerHTML = customBtnStyle; document.head.appendChild(style);}


// Frontend.
const Home = ({ onLogout }) => {
  // States.
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [voucherValidation, setVoucherValidation] = useState({
    status: null, // 'valid', 'expired', 'invalid', 'used'
    message: "",
    color: "#fff"
  });
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftCardOrders, setGiftCardOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredGiftCardOrders, setFilteredGiftCardOrders] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Select your location");
  const [amountToRedeem, setAmountToRedeem] = useState("");
  const [wasAmountReduced, setWasAmountReduced] = useState(false);
  const [isGiftCard, setIsGiftCard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showGiftCardSearchPopup, setShowGiftCardSearchPopup] = useState(false);
  const [giftCardSearchCode, setGiftCardSearchCode] = useState("");
  const [giftCardValidation, setGiftCardValidation] = useState({
    status: null, // 'valid', 'expired', 'invalid', 'used'
    message: "",
    color: "#fff"
  });
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [employeeName, setEmployeeName] = useState("");


// Format date.
const formatDates = (value) => {
  if (!value) return "—";
  const arr = Array.isArray(value) ? value : [value];
  const formatted = arr.map((d) => {const dt = d instanceof Date ? d : new Date(d); if (Number.isNaN(dt.getTime())) return null; return dt.toLocaleDateString();}).filter(Boolean);
  if (!formatted.length) return "—";
  return formatted.reduce((acc, date, i) => {
    if (i === 0) return [date];
    return [...acc, <br key={i} />, date];
  }, []);
};

// Format voucher code.
const formatVoucherCode = (value) => {const cleanValue = value.replace(/[^A-Z0-9]/g, '');if (cleanValue.length <= 4) {return cleanValue;}const truncated = cleanValue.substring(0, 8);return truncated.substring(0, 4) + '-' + truncated.substring(4);};

// Format dollar amount.
const formatDollarAmount = (amount) => {if (amount === null || amount === undefined || amount === "") return "—";const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;if (isNaN(numericAmount)) return "—";return numericAmount.toFixed(2);};

// Handle amount change.
const handleAmountChange = (e) => {
  let val = e.target.value.replace(/[$,]/g, "").replace(/[^0-9.]/g, "");
  const decimalCount = (val.match(/\./g) || []).length;
  if (decimalCount > 1) {val = val.substring(0, val.lastIndexOf('.'));}
  const decimalIndex = val.indexOf('.');
  if (decimalIndex !== -1 && val.length > decimalIndex + 3) {val = val.substring(0, decimalIndex + 3);}
  const numericValue = parseFloat(val);
  const maxBalance = selectedVoucher?.remainingBalance ?? selectedVoucher?.totalPrice ?? 0;
  setWasAmountReduced(false);  
  // If entered amount exceeds max balance, automatically reduce to max.
  if (!isNaN(numericValue) && numericValue > maxBalance) {const formattedMaxBalance = formatDollarAmount(maxBalance);setAmountToRedeem(formattedMaxBalance);setWasAmountReduced(true);toast.info(`Amount reduced to maximum available balance: $${formattedMaxBalance}`);} else {setAmountToRedeem(val);}
};

  // Handle resize.
  useEffect(() => {
    const handleResize = () => {setIsMobile(window.innerWidth <= 1100);};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Validate voucher in real-time as user types.
  useEffect(() => {
    if (!voucherSearchCode.trim()) { setVoucherValidation({status: null, message: "Enter 4-digit code format (XXXX-XXXX)", color: "#fff"});return;} const formattedCode = voucherSearchCode.replace(/[^A-Z0-9]/g, '');
    
    // Find matching order.
    const matchingOrder = orders.find(order => order.vouchers.some(voucher => voucher.code.replace(/[^A-Z0-9]/g, '') === formattedCode));

    if (!matchingOrder) { setVoucherValidation({ status: 'invalid', message: "Invalid voucher number", color: "#dc3545"});return;}

    const voucher = matchingOrder.vouchers.find(v => v.code.replace(/[^A-Z0-9]/g, '') === formattedCode);


    // Check expiration by comparing voucher.expire with voucher.createdAt
    const expireDate = voucher?.expire;
    const createdAt = voucher?.createdAt;
    let safeExpireDate = expireDate ? expireDate.replace(' ', 'T') : null;
    let safeCreatedAt = createdAt ? createdAt.replace(' ', 'T') : null;
    if (safeExpireDate && safeCreatedAt) {
      const expirationDate = new Date(safeExpireDate);
      const createdDate = new Date(safeCreatedAt);
      // Check for invalid or default 1970 date
      if (!isNaN(expirationDate.getTime()) && !isNaN(createdDate.getTime()) && expirationDate.getFullYear() > 1971) {
        if (expirationDate < new Date()) {
          const diffMs = expirationDate - createdDate;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const formattedExpireDate = (() => {
            const date = new Date(safeExpireDate);
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const yyyy = date.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
          })();
          setVoucherValidation({status: 'expired', message: `Voucher expired on ${formattedExpireDate} (${diffDays} days after purchase)`, color: "#fd7e14"});
          return;
        }
      }
    }

    // Voucher is valid.
    setVoucherValidation({status: 'valid', message: "Valid voucher", color: "#28a745"});
  }, [voucherSearchCode, orders]);

// Set gift card validation.
useEffect(() => {
  if (!giftCardSearchCode.trim()) {setGiftCardValidation({status: null, message: "Enter 4-digit code format (XXXX-XXXX)", color: "white"});return;}

  const formattedCode = giftCardSearchCode.replace(/[^A-Z0-9]/g, '');
  
  // Find matching gift card.
  const matchingOrder = giftCardOrders.find(order =>
    order.vouchers.some(giftCard =>
      giftCard.code.replace(/[^A-Z0-9]/g, '') === formattedCode
    )
  );

  if (!matchingOrder) {setGiftCardValidation({status: 'invalid', message: "Invalid gift card number", color: "#dc3545"});return;}

  // Check if gift card is already used.
  if (matchingOrder.remainingBalance === 0) { setGiftCardValidation({ status: 'used', message: "Gift card has been fully used", color: "#6c757d"});return;}

  // Gift card is valid.
  setGiftCardValidation({ status: 'valid', message: "Valid gift card", color: "#28a745"});

}, [giftCardSearchCode, giftCardOrders]);

// Handle gift card search.
const handleGiftCardSearch = () => {
  if (!giftCardSearchCode.trim()) {
    toast.error("Please enter a gift card code");
    return;
  }

  // Only allow search if gift card is valid.
  if (giftCardValidation.status !== 'valid') {
    toast.error(giftCardValidation.message);
    return;
  }

  const formattedCode = giftCardSearchCode.replace(/[^A-Z0-9]/g, '');
  // Flatten all gift cards with their parent order reference
  const matchingGiftCards = giftCardOrders.flatMap(order =>
    order.vouchers
      .filter(giftCard => giftCard.code.replace(/[^A-Z0-9]/g, '') === formattedCode)
      .map(giftCard => ({ ...giftCard, _parentOrder: order }))
  );
  console.log("Gift search results", matchingGiftCards);
  setFilteredGiftCardOrders(
    matchingGiftCards.length > 0
      ? matchingGiftCards.map(g => ({ ...g._parentOrder, vouchers: [g] }))
      : []
  );
  setSearchQuery(giftCardSearchCode);
  setShowGiftCardSearchPopup(false);
};

// Handle tab change.
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchQuery("");
  // Clear popup state when switching tabs
  setShowPopup(false);
  setSelectedVoucher(null);
  setAmountToRedeem("");
  setIsGiftCard(false);
  setWasAmountReduced(false);
  if (tab === "vouchers") {
    const usedVouchers = orders.filter((order) => 
      order.statusUse === true || order.vouchers?.some(voucher => voucher.status === 'USED'));
    setFilteredOrders(usedVouchers);
    // setShowSearchPopup(true);
  } else if (tab === "giftcards") {
    setFilteredGiftCardOrders([]);
    // setShowGiftCardSearchPopup(true);
  }
};

// Fetch locations.
useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/loc`);
        const data = await response.json();
        console.log("📍 Locations from API:", data.locations);
        setLocations(data.locations);
      } catch (error) {
        console.error("❌ Failed to fetch locations:", error);
      }
    };

    fetchLocations();
}, []);

const hasType = (order, target) => {
  if (!Array.isArray(order.lineItems)) return false;

  return order.lineItems.some((item) => {
    let type = item.type;
    if (typeof type === "string") {
      try {
        type = JSON.parse(type); // e.g. ["voucher"]
      } catch {
        return false;
      }
    }
    return Array.isArray(type) && type.includes(target);
  });
};

  // Fetch orders with vouchers.
  useEffect(() => {
    const fetchOrdersWithVouchers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou`);
        const data = await response.json();
        console.log("📦 Orders with Vouchers:", data);

        // Filter orders with type voucher.
        const voucherOrders = data.filter((order) => hasType(order, "voucher"));

        console.log("🎫 Filtered Voucher Orders:", voucherOrders);
        setOrders(voucherOrders);
        // setFilteredOrders(voucherOrders);
      } catch (error) {
        console.error("❌ Failed to fetch voucher orders:", error);
      }
    };

    fetchOrdersWithVouchers();
  }, []);

  // Fetch orders with gifts.
  useEffect(() => {
    const fetchOrdersWithGiftCards = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou`);
        const data = await response.json();
        console.log("🎁 Orders with Gift Cards:", data);

        // Filter orders with type gift.
        const giftOrders = data.filter((order) => hasType(order, "gift"));

        console.log("🎟️ Filtered Gift Card Orders:", giftOrders);
        setGiftCardOrders(giftOrders);
      } catch (error) {
        console.error("❌ Failed to fetch gift card orders:", error);
      }
    };

    fetchOrdersWithGiftCards();
  }, []);

// Handle voucher search.
const handleVoucherSearch = () => {
    if (!voucherSearchCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }

    // Only allow search if voucher is valid
    if (voucherValidation.status !== 'valid') {
      toast.error(voucherValidation.message);
      return;
    }

    const formattedCode = voucherSearchCode.replace(/[^A-Z0-9]/g, '');
    // Flatten all vouchers with their parent order reference.
    const matchingVouchers = orders.flatMap(order =>
      order.vouchers
        .filter(voucher => voucher.code.replace(/[^A-Z0-9]/g, '') === formattedCode)
        .map(voucher => ({ ...voucher, _parentOrder: order }))
    );
    console.log("Voucher search results", matchingVouchers);
    // If you want to keep the same filteredOrders structure, wrap in a fake order
    setFilteredOrders(
      matchingVouchers.length > 0
        ? matchingVouchers.map(v => ({ ...v._parentOrder, vouchers: [v] }))
        : []
    );
    setSearchQuery(voucherSearchCode);
    setShowSearchPopup(false);
  };

// Handle use voucher.
const handleUseVoucher = (voucher) => {
  setSelectedVoucher(voucher);
  setIsGiftCard(false);
  setShowPopup(true);
};

// Handle use gift card.
const handleUseGiftCard = (giftCard, order) => {
  setSelectedVoucher({
    orderNumber: giftCard.code,
    ...giftCard,
    totalPrice: order.totalPrice,
    remainingBalance: order.remainingBalance,
    orderId: order.id,
    location: order.location,
    cashHistory: order.cashHistory || [],
  });
  setIsGiftCard(true);
  setShowPopup(true);
};

// Handle redeem gift card.
const handleRedeemGiftCard = async () => {
    if (!selectedVoucher || !amountToRedeem || !employeeName) {
      toast.info("Please enter amount and name.");
      return;
    }

    try {
      const locationName = localStorage.getItem("name");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vou/redeem`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: selectedVoucher.code, 
            redeemAmount: parseFloat(amountToRedeem), 
            locationUsed: [locationName],
            redeemedAt: [new Date().toISOString()],
            useDate: new Date().toISOString(),
            username: employeeName,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Gift redeemed successfully!");
        setGiftCardOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.id === data.updatedOrder.id 
              ? {
                  ...order, 
                  remainingBalance: data.updatedOrder.remainingBalance, 
                  locationUsed: data.updatedOrder.locationUsed, 
                  redeemedAt: data.updatedOrder.redeemedAt,
                  username: data.updatedOrder.username,
                  cashHistory: data.updatedOrder.cashHistory,
                } 
              : order
          )
        );
        closePopup();
      } else {
        toast.error(data.error || "Failed to redeem.");
      }
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      toast.error("Error redeeming gift card.");
    }
  };


// Handle mark voucher as used.
const handleMarkVoucherAsUsed = async () => {
    if (!selectedVoucher || !employeeName) {
      toast.info("Please enter name.");
      return;
    }

    try {
      const locationName = localStorage.getItem("name");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vou/redeems`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({code: selectedVoucher.code, locationUsed: [locationName], redeemedAt: [new Date().toISOString()], useDate: new Date().toISOString(), username: employeeName}),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Voucher used successfully!");
        setOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.vouchers?.some((v) => v.code === selectedVoucher.code) 
              ? {
                  ...order, 
                  statusUse: true, 
                  locationUsed: data.updatedOrder.locationUsed, 
                  redeemedAt: data.updatedOrder.redeemedAt,
                  username: data.updatedOrder.username,
                } 
              : order
          )
        );
        closePopup();
      } else {
        toast.error(data.error || "Failed to mark voucher as used.");
      }
    } catch (error) {
      console.error("Error marking voucher as used:", error);
      toast.error("Error marking voucher as used.");
    }
};


// Close popup.
const closePopup = () => {
  setShowPopup(false);
  setSelectedVoucher(null);
  setSelectedLocation("Select your location");
  setAmountToRedeem("");
  setIsGiftCard(false);
  setWasAmountReduced(false);
  setEmployeeName("");
};

// Close search popup.
const closeSearchPopup = () => {
  setShowSearchPopup(false);
  setVoucherSearchCode("");
  setSearchQuery("");
  setVoucherValidation({
    status: null,
    message: "Enter 4-digit code format (XXXX-XXXX)",
    color: "#fff"
  });
};

// Close gift card search popup.
const closeGiftCardSearchPopup = () => {
  setShowGiftCardSearchPopup(false);
  setGiftCardSearchCode("");
  setSearchQuery("");
  setFilteredGiftCardOrders([]);
  setGiftCardValidation({
    status: null,
    message: "Enter 4-digit code format (XXXX-XXXX)",
    color: "#fff"
  });
};

// For vouchers, show USED status by default.
useEffect(() => {
  // Only run this effect if not in the middle of a search popup (i.e., let handleVoucherSearch control filteredOrders)
  if (showSearchPopup) return;
  if (!searchQuery.trim()) {
    const usedVouchers = orders.filter((order) => 
      order.statusUse === true || order.vouchers?.some(voucher => voucher.status === 'USED'));
    setFilteredOrders(usedVouchers);
  } else {
    const code = searchQuery.replace(/[^A-Z0-9]/g, '');
    // Use the same flattening logic as in handleVoucherSearch for consistency
    const matchingVouchers = orders.flatMap(order =>
      order.vouchers
        .filter(voucher => voucher.code.replace(/[^A-Z0-9]/g, '').includes(code))
        .map(voucher => ({ ...voucher, _parentOrder: order }))
    );
    setFilteredOrders(
      matchingVouchers.length > 0
        ? matchingVouchers.map(v => ({ ...v._parentOrder, vouchers: [v] }))
        : []
    );
  }
}, [searchQuery, orders, showSearchPopup]);


// Show only when gift code is enter.
useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredGiftCardOrders([]);
  } else {
    const code = searchQuery.replace(/[^A-Z0-9]/g, '');
    // Use the same flattening logic as in handleGiftCardSearch for consistency
    const matchingGiftCards = giftCardOrders.flatMap(order =>
      order.vouchers
        .filter(giftCard => giftCard.code.replace(/[^A-Z0-9]/g, '').includes(code))
        .map(giftCard => ({ ...giftCard, _parentOrder: order }))
    );
    setFilteredGiftCardOrders(
      matchingGiftCards.length > 0
        ? matchingGiftCards.map(g => ({ ...g._parentOrder, vouchers: [g] }))
        : []
    );
  }
}, [searchQuery, giftCardOrders]);

// If a location is selected, filter. Otherwise, show all filteredOrders.
const locationFilteredOrders =
  selectedLocation && selectedLocation !== "" && selectedLocation !== "Select your location"
    ? filteredOrders.filter(order =>
        order.vouchers.some(voucher =>
          voucher.usedLocation?.includes(selectedLocation) ||
          order.locationUsed?.includes(selectedLocation)
        )
      )
    : filteredOrders;

    const now = new Date();

const dateFilteredOrders = selectedDateRange
  ? locationFilteredOrders.filter(order => {
      if (!order.processedAt) return false;
      const orderDate = new Date(order.processedAt);

      switch (selectedDateRange) {
        case "1d": return (now - orderDate) <= 24 * 60 * 60 * 1000;
        case "1w": return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
        case "1m": return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
        case "6m": return (now - orderDate) <= 182 * 24 * 60 * 60 * 1000;
        case "1y": return (now - orderDate) <= 365 * 24 * 60 * 60 * 1000;
        default:   return true;
      }
    })
  : locationFilteredOrders;

// For gift cards
const dateFilteredGiftCardOrders = selectedDateRange
  ? filteredGiftCardOrders.filter(order => {
      if (!order.processedAt) return false;
      const orderDate = new Date(order.processedAt);

      switch (selectedDateRange) {
        case "1d": return (now - orderDate) <= 24 * 60 * 60 * 1000;
        case "1w": return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
        case "1m": return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
        case "6m": return (now - orderDate) <= 182 * 24 * 60 * 60 * 1000;
        case "1y": return (now - orderDate) <= 365 * 24 * 60 * 60 * 1000;
        default:   return true;
      }
    })
  : filteredGiftCardOrders;


  return (
    <div style={styles.mainContainer(isMobile)}>
     <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.leftGroup}>
          <a href="https://redemptionsolution.myshopify.com" target="_blank">
           <img src="https://res.cloudinary.com/dgk3gaml0/image/upload/v1755837350/lxkizea7xfe7omtekg5r.png" alt="Logo" style={{height: '50px'}}/>
          </a>
        <h1 style={styles.redemption}>Voucher Redemption Portal</h1>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.contentContainer(isMobile)}>
        {/* Sort and Filter */}
        <h2 style={styles.sortFilterHeader}>Sort and Filter</h2>

        {/* Filter Buttons */}
        <div style={styles.filterButtonsRow}>
          <div style={styles.filterEmptySpace(isMobile)}></div>
          <div style={styles.filterButtonsGrid(activeTab, isMobile)}>
{activeTab === "vouchers" ? (
<>
<select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)} style={{ ...styles.filterButton, padding: "6px", cursor: "pointer", textAlign: "center" }}>
<option value="">Purchase Date</option><option value="1d">Last Day</option><option value="1w">Last Week</option><option value="1m">Last Month</option><option value="6m">Last 6 Months</option><option value="1y">Last 1 Year</option>
</select>

{/* Location Dropdown */}
<select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={{ ...styles.filterButton, padding: "6px", cursor: "pointer" }}>
  <option value="" style={{textAlign: 'center'}}>All Locations</option>
  {locations.map((loc) => (<option key={loc.id} value={loc.name} style={{textAlign: 'center'}}>{loc.name}</option>))}
</select>


<input type="text" placeholder="Search Code (XXXX-XXXX)" value={searchQuery} maxLength={9} onChange={(e) => { let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (val.length > 8) val = val.slice(0, 8); if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4); setSearchQuery(val);}} onFocus={() => setShowSearchPopup(true)}  style={styles.searchInput}/>
</>
) : (
<>
<select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)} style={{ ...styles.filterButton, padding: "6px", cursor: "pointer", textAlign: "center" }}>
  <option value="">Purchase Date</option><option value="1d">Last Day</option><option value="1w">Last Week</option><option value="1m">Last Month</option><option value="6m">Last 6 Months</option><option value="1y">Last 1 Year</option>
</select>
<input type="text" placeholder="Search Code (XXXX-XXXX)" value={searchQuery} maxLength={9} onChange={(e) => { let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (val.length > 8) val = val.slice(0, 8); if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4); setSearchQuery(val);}} onFocus={() => setShowGiftCardSearchPopup(true)}  style={styles.searchInput}/>
</>
)}
  </div>
</div>

        {/* Mobile Tabs */}
        <div style={styles.mobileTabsContainer(isMobile)}>
          <button onClick={() => handleTabChange("vouchers")} style={styles.mobileTab(activeTab === "vouchers")}>Vouchers</button>
          <button onClick={() => handleTabChange("giftcards")} style={styles.mobileTab(activeTab === "giftcards")}>Gift Cards</button>
        </div>

        {/* Layout */}
        <div style={styles.mainContentLayout(isMobile)}>
          {/* Tabs */}
          <div style={styles.leftTabsContainer(isMobile)}>
            <button onClick={() => handleTabChange("vouchers")} style={styles.leftTab(activeTab === "vouchers")}>Vouchers</button>
            <button onClick={() => handleTabChange("giftcards")} style={styles.leftTab(activeTab === "giftcards")}>Gift Cards</button>
          </div>

          {/* Table */}
          <div style={styles.rightSideContent}>
            <div style={styles.tableContainer}>
              <Table
                dataSource={activeTab === "vouchers"
                  ? dateFilteredOrders.flatMap((order, index) =>
                      order.vouchers.map((voucher, vIndex) => {
                        const isUsed = order.statusUse === true || voucher.status === "USED";
                        return {
                          key: voucher.id,
                          product: voucher.productTitle || "—",
                          code: voucher.code || "—",
                          expire: voucher.expire ? (() => {const safeExpire = voucher.expire.replace(' ', 'T');const date = new Date(safeExpire);if (isNaN(date.getTime())) return "—";const mm = String(date.getMonth() + 1).padStart(2, "0");const dd = String(date.getDate()).padStart(2, "0");const yyyy = date.getFullYear();return `${mm}/${dd}/${yyyy}`})() : "—",
                          location: order.locationUsed || "—",
                          useDate: formatDates(order.redeemedAt) || "—",
                          status: isUsed ? "USED" : "VALID",
                          usedBy: order.username?.length ? order.username.map((user, idx) => <div key={idx}>{user}</div>) : "—",
                          action: { isUsed, voucher, order },
                        };
                      })
                    )
                  : dateFilteredGiftCardOrders.flatMap((order, index) =>
                      order.vouchers.map((giftCard, vIndex) => ({
                        key: giftCard.id,
                        product: giftCard.productTitle,
                        code: giftCard.code,
                        value: `$${formatDollarAmount(order.totalPrice)}`,
                        history: order.cashHistory.map((amt, idx) => <div key={idx}>${formatDollarAmount(amt)}</div>),
                        location: order.locationUsed?.length ? order.locationUsed.map((loc, idx) => (<div key={idx}>{loc}</div>)) : "—",
                        useDate: formatDates(order.redeemedAt) || "—",
                        usedBy: order.username?.length ? order.username.map((user, idx) => <div key={idx}>{user}</div>) : "—",
                        action: { used: giftCard.used, giftCard, order },
                      }))
                    )
                }
                columns={activeTab === "vouchers"
                  ? [
                      { title: "Product", dataIndex: "product", key: "product" },
                      { title: "Code", dataIndex: "code", key: "code" },
                      { title: "Expire", dataIndex: "expire", key: "expire" },
                      { title: "Location", dataIndex: "location", key: "location" },
                      { title: "Use Date", dataIndex: "useDate", key: "useDate" },
                      { title: "Status", dataIndex: "status", key: "status" },
                      { title: "Employee Name", dataIndex: "usedBy", key: "usedBy" },
                      {
                        title: "",
                        dataIndex: "action",
                        key: "action",
                        render: (action) => (
                          <div style={styles.buttonContainer}>
                            <button
                              className="custom-use-btn"
                              onClick={() => { if (!action.isUsed) handleUseVoucher(action.voucher, action.order); }}
                              disabled={action.isUsed}
                            >
                              Use
                            </button>
                          </div>
                        ),
                      },
                    ]
                  : [
                      { title: "Product", dataIndex: "product", key: "product" },
                      { title: "Code", dataIndex: "code", key: "code" },
                      { title: "Value", dataIndex: "value", key: "value" },
                      { title: "Usage History", dataIndex: "history", key: "history" },
                      { title: "Remaining Balance", dataIndex: "remainingBalance", key: "remainingBalance", render: (_, record) => {
                        const order = record.action.order;
                        return order ? `$${formatDollarAmount(order.remainingBalance)}` : "—";
                      }},
                      { title: "Location", dataIndex: "location", key: "location" },
                      { title: "Use Date", dataIndex: "useDate", key: "useDate" },
                      { title: "Employee Name", dataIndex: "usedBy", key: "usedBy" },
                      {
                        title: "",
                        dataIndex: "action",
                        key: "action",
                        render: (action) => (
                          <div style={styles.buttonContainer}>
                            {!action.used && (
                              <button
                                className="custom-use-btn"
                                onClick={() => handleUseGiftCard(action.giftCard, action.order)}
                              >
                                Use
                              </button>
                            )}
                          </div>
                        ),
                      },
                    ]
                }
                pagination={false}
                scroll={{ x: true }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Popup with Validation */}
      {showSearchPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupModal(isMobile)}>
            <button onClick={closeSearchPopup} style={styles.closeButton}>×</button>

            <div style={styles.popupContentContainer}>           
              <div style={styles.popupFlexContainer(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>Voucher ID:</span>
                <input 
                  type="text" 
                  value={voucherSearchCode}
                  onChange={(e) => {
                    const formatted = formatVoucherCode(e.target.value.toUpperCase());
                    setVoucherSearchCode(formatted);
                  }}
                  placeholder="XXXX-XXXX"
                  style={styles.popupInput(isMobile)}
                  maxLength={9}
                />
                {/* Dynamic validation message with color */}
                <span style={{
                  ...styles.validationText(isMobile),
                  color: voucherValidation.color,
                  fontWeight: voucherValidation.status ? '500' : 'normal'
                }}>
                  ● {voucherValidation.message}
                </span>
              </div>

              <div style={styles.redemButt}>
                <button 
                  onClick={handleVoucherSearch}
                  style={{
                    ...styles.redeemButts(isMobile),
                    opacity: voucherValidation.status === 'valid' ? 1 : 0.5,
                    cursor: voucherValidation.status === 'valid' ? 'pointer' : 'not-allowed'
                  }}
                  disabled={voucherValidation.status !== 'valid'}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGiftCardSearchPopup && (
  <div style={styles.popupOverlay}>
    <div style={styles.popupModal(isMobile)}>
      <button onClick={closeGiftCardSearchPopup} style={styles.closeButton}>×</button>

      <div style={styles.popupContentContainer}>           
        <div style={styles.popupFlexContainer(isMobile)}>
          <span style={styles.popupLabel(isMobile)}>Gift Card ID:</span>
          <input 
            type="text" 
            value={giftCardSearchCode}
            onChange={(e) => {
              const formatted = formatVoucherCode(e.target.value.toUpperCase());
              setGiftCardSearchCode(formatted);
            }}
            placeholder="XXXX-XXXX"
            style={styles.popupInput(isMobile)}
            maxLength={9}
          />
          {/* Dynamic validation message with color */}
          <span style={{
            ...styles.validationText(isMobile),
            color: giftCardValidation.color,
            fontWeight: giftCardValidation.status ? '500' : 'normal'
          }}>
            ● {giftCardValidation.message}
          </span>
        </div>

        <div style={styles.redemButt}>
          <button 
            onClick={handleGiftCardSearch}
            style={{
              ...styles.redeemButts(isMobile),
              opacity: giftCardValidation.status === 'valid' ? 1 : 0.5,
              cursor: giftCardValidation.status === 'valid' ? 'pointer' : 'not-allowed'
            }}
            disabled={giftCardValidation.status !== 'valid'}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Use Voucher/Gift Card Popup */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupModal(isMobile)}>
            <button onClick={closePopup} style={styles.closeButton}>×</button>

            <div style={styles.popupContentContainer}>
              <div style={styles.popupFlexContainer(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>{isGiftCard ? "Gift Card ID:" : "Voucher ID:"}</span>
                <input type="text" value={selectedVoucher?.code || ""} readOnly style={styles.popupInput(isMobile)}/>
                <span style={styles.validationText(isMobile)}>● {isGiftCard ? "Valid Gift Card" : "Valid voucher"}</span>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>Amount to Redeem:</span>
                    <input type="text" value={amountToRedeem !== "" ? `$${amountToRedeem}` : ""} onChange={handleAmountChange} placeholder="$XX.XX" style={{...styles.popupInput(isMobile), borderColor: wasAmountReduced ? '#28a745' : styles.popupInput(isMobile).borderColor}}/>
                  </>
                )}
              </div>

              <div style={styles.popupFlexContainers(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>Name:</span>
                <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Enter name" style={styles.popupInput(isMobile)} required/>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>Remaining Balance:</span>
                    <input type="text" value={selectedVoucher?.remainingBalance != null ? `$${formatDollarAmount(selectedVoucher.remainingBalance)}` : `$${formatDollarAmount(selectedVoucher?.totalPrice || 0)}`} style={styles.popupReadonlyInput(isMobile)}/>
                  </>
                )}
              </div>
              <div style={styles.redemButt}>
                <button onClick={isGiftCard ? handleRedeemGiftCard : handleMarkVoucherAsUsed} style={{...styles.redeemButts(isMobile), cursor: employeeName.trim() === "" ? "not-allowed" : "pointer", opacity: employeeName.trim() === "" ? 0.5 : 1}} disabled={employeeName.trim() === ""}>Redeem</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Home;