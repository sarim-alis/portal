// Imports.
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Table, DatePicker } from "antd";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import styles from "../styles/home.js";
const customBtnStyle = `
.custom-use-btn { padding: 6px 18px; border-radius: 6px; font-weight: 600; font-size: 15px; border: none; transition: background 0.2s, color 0.2s; background: #000; color: #fff; margin: 0 2px; }
.custom-use-btn[disabled], .custom-use-btn:disabled { background: #d3d3d3 !important; color: #666 !important; cursor: not-allowed !important; opacity: 1 !important; }`;
if (typeof document !== 'undefined' && !document.getElementById('custom-use-btn-style')) { const style = document.createElement('style'); style.id = 'custom-use-btn-style'; style.innerHTML = customBtnStyle; document.head.appendChild(style);}


// Frontend.
const Home = ({ onLogout }) => {
const { RangePicker } = DatePicker;
  // States.
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [voucherValidation, setVoucherValidation] = useState({ status: null, message: "", color: "#fff"});
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftCardOrders, setGiftCardOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredGiftCardOrders, setFilteredGiftCardOrders] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Select your location");
  const [amountToRedeem, setAmountToRedeem] = useState("");
  const [wasAmountReduced, setWasAmountReduced] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isGiftCard, setIsGiftCard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showGiftCardSearchPopup, setShowGiftCardSearchPopup] = useState(false);
  const [giftCardSearchCode, setGiftCardSearchCode] = useState("");
  const [giftCardValidation, setGiftCardValidation] = useState({ status: null, message: "", color: "#fff"});
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const voucherPopupInputRef = React.useRef(null);
  const giftCardPopupInputRef = React.useRef(null);

  // Refs for debounce timers to avoid excessive network calls while typing
  const voucherRefreshTimer = React.useRef(null);
  const giftRefreshTimer = React.useRef(null);


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

// Escape string for use in RegExp
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  if (!isNaN(numericValue) && numericValue > maxBalance) {const formattedMaxBalance = formatDollarAmount(maxBalance);setAmountToRedeem(formattedMaxBalance);setWasAmountReduced(true);toast.info(`Amount reduced to maximum available balance: $${formattedMaxBalance}`);} else {setAmountToRedeem(val);}
};

  // Handle resize.
  useEffect(() => {
    const handleResize = () => {setIsMobile(window.innerWidth <= 1100);};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {if (showSearchPopup && voucherPopupInputRef.current) {voucherPopupInputRef.current.focus()}}, [showSearchPopup]);
  useEffect(() => {if (showGiftCardSearchPopup && giftCardPopupInputRef.current) {giftCardPopupInputRef.current.focus()}}, [showGiftCardSearchPopup]);

  // Validate voucher in real-time as user types.
  useEffect(() => {
    if (!voucherSearchCode.trim()) {
      setVoucherValidation({ status: null, message: "Enter 9-character code format (XXXX-XXXX)", color: "#fff" });
      return;
    }
    const formattedCode = voucherSearchCode.replace(/[^A-Z0-9]/g, '');

    if (voucherSearchCode.length !== 9) {
      setVoucherValidation({ status: 'invalid', message: "Invalid code format (must be XXXX-XXXX)", color: "#dc3545" });
      return;
    }

    let foundVoucher = null;
    let foundOrder = null;
    for (const order of orders) {
      const voucher = order.vouchers.find(v => v.code.replace(/[^A-Z0-9]/g, '') === formattedCode);
      if (voucher) {
        foundVoucher = voucher;
        foundOrder = order;
        break;
      }
    }

    if (!foundVoucher) {
      setVoucherValidation({ status: 'invalid', message: "Invalid voucher code", color: "#dc3545" });
      return;
    }

    if (foundOrder && foundOrder.statusUse === true) {
      setVoucherValidation({ status: 'used', message: "Voucher is already redeemed", color: "#fff" });
      return;
    }

    const expireDate = foundVoucher?.expire;
    const createdAt = foundVoucher?.createdAt;
    let safeExpireDate = expireDate ? expireDate.replace(' ', 'T') : null;
    let safeCreatedAt = createdAt ? createdAt.replace(' ', 'T') : null;
    if (safeExpireDate && safeCreatedAt) {
      const expirationDate = new Date(safeExpireDate);
      const createdDate = new Date(safeCreatedAt);
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
          // Show a clear, consistent expired message both at search and at redeem time.
          const redeemValueRaw = foundVoucher && (foundVoucher.afterExpiredPrice != null ? foundVoucher.afterExpiredPrice : (foundVoucher.totalPrice != null ? foundVoucher.totalPrice : null));
          const redeemValueText = redeemValueRaw != null ? `$${formatDollarAmount(redeemValueRaw)}` : '—';
          const expireMessage = `Voucher code has expired. Voucher is redeemable for a value of: ${redeemValueText}`;
          setVoucherValidation({ status: 'expired', message: expireMessage, color: "#fd7e14" });
          return;
        }
      }
    }
  
    setVoucherValidation({ status: 'valid', message: "Valid voucher", color: "#28a745" });
  }, [voucherSearchCode, orders]);

  // Debounced refresh when user types voucher code so validation/search uses latest data
  useEffect(() => {
    if (voucherRefreshTimer.current) clearTimeout(voucherRefreshTimer.current);
    if (!voucherSearchCode.trim()) return;
    voucherRefreshTimer.current = setTimeout(() => {
      refreshOrders().catch(err => console.error('Error refreshing orders on voucher typing:', err));
    }, 1); // 100ms debounce
    return () => { if (voucherRefreshTimer.current) clearTimeout(voucherRefreshTimer.current); };
  }, [voucherSearchCode]);

// Set gift card validation.
useEffect(() => {
  if (!giftCardSearchCode.trim()) {
    setGiftCardValidation({status: null, message: "Enter 11-character code format (XXXXX-XXXXX)", color: "white"});
    return;
  }
  const formattedCode = giftCardSearchCode.replace(/[^A-Z0-9]/g, '');
  if (giftCardSearchCode.length !== 11) {
    setGiftCardValidation({ status: 'invalid', message: "Invalid code format (must be XXXXX-XXXXX)", color: "#dc3545" });
    return;
  }
  // Find matching gift card.
  const matchingOrder = giftCardOrders.find(order => order.vouchers.some(giftCard => giftCard.code.replace(/[^A-Z0-9]/g, '') === formattedCode));
  if (!matchingOrder) {setGiftCardValidation({status: 'invalid', message: "Invalid gift card number", color: "#dc3545"});return;}
  if (matchingOrder.remainingBalance === 0) { setGiftCardValidation({ status: 'used', message: "Gift card has been fully used", color: "#6c757d"});return;}
  setGiftCardValidation({ status: 'valid', message: "Valid gift card", color: "#28a745"});
}, [giftCardSearchCode, giftCardOrders]);

  // Debounced refresh when user types gift card code
  useEffect(() => {
    if (giftRefreshTimer.current) clearTimeout(giftRefreshTimer.current);
    if (!giftCardSearchCode.trim()) return;
    giftRefreshTimer.current = setTimeout(() => {
      refreshOrders().catch(err => console.error('Error refreshing orders on gift typing:', err));
    }, 1);
    return () => { if (giftRefreshTimer.current) clearTimeout(giftRefreshTimer.current); };
  }, [giftCardSearchCode]);

// Handle gift card search.
const handleGiftCardSearch = async () => {
  if (!giftCardSearchCode.trim()) { toast.error("Please enter a gift card code"); return;}

  // Refresh orders so we search against the latest server state
  await refreshOrders();

  // Only allow search if gift card is valid.
  if (giftCardValidation.status !== 'valid') { toast.error(giftCardValidation.message); return;}

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
const handleTabChange = (tab) => { setActiveTab(tab); setSearchQuery(""); setShowPopup(false); setSelectedVoucher(null); setAmountToRedeem(""); setIsGiftCard(false); setWasAmountReduced(false);
  if (tab === "vouchers") {
    // Only show orders where at least one voucher is redeemed
    const usedVouchers = orders
      .map(order => {
        const redeemedVouchers = order.vouchers.filter(voucher => voucher.statusUse || voucher.used || voucher.status === 'USED');
        if (redeemedVouchers.length > 0) {
          return { ...order, vouchers: redeemedVouchers };
        }
        return null;
      })
      .filter(Boolean);
    setFilteredOrders(usedVouchers);
  }
  else if (tab === "giftcards") { setFilteredGiftCardOrders([]);}
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
// Fetch all orders once and split vouchers/gifts; expose refreshOrders to update UI after actions
const refreshOrders = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou`);
    const data = await response.json();
    console.log("� refreshOrders fetched:", data?.length ?? 0);

    // derive voucher and gift orders
    const voucherOrders = [];
    const giftOrders = [];
    if (Array.isArray(data)) {
      for (const order of data) {
        try {
          // Prefer explicit type markers in lineItems
          if (hasType(order, "gift")) {
            giftOrders.push(order);
            continue;
          }
          if (hasType(order, "voucher")) {
            voucherOrders.push(order);
            continue;
          }

          // Fallback: inspect voucher objects inside the order for a type field
          if (Array.isArray(order.vouchers) && order.vouchers.length > 0) {
            const anyGift = order.vouchers.some(v => v && v.type && String(v.type).toLowerCase().includes('gift'));
            const anyVoucher = order.vouchers.some(v => v && v.type && String(v.type).toLowerCase().includes('voucher'));
            if (anyGift) { giftOrders.push(order); continue; }
            if (anyVoucher) { voucherOrders.push(order); continue; }

            // Last-resort: if no explicit markers but vouchers exist, treat as voucher order so codes are searchable
            voucherOrders.push(order);
          }
        } catch (e) {
          // defensive: ignore malformed orders
        }
      }
    }

    setOrders(voucherOrders);
    setGiftCardOrders(giftOrders);
  } catch (error) {
    console.error("Failed to refresh orders:", error);
  }
};

useEffect(() => { refreshOrders(); }, []);

// Handle voucher search.
const handleVoucherSearch = async () => {
  if (!voucherSearchCode.trim()) { toast.error("Please enter a voucher code"); return; }

  // Refresh orders so we search against the latest server state
  await refreshOrders();

  // Only allow search if voucher is valid or expired (but not used)
  if (voucherValidation.status === 'invalid' || voucherValidation.status === 'used') {
    toast.error(voucherValidation.message);
    return;
  }

  const formattedCode = voucherSearchCode.replace(/[^A-Z0-9]/g, '');
  // Only show vouchers that are not redeemed (statusUse !== true)
  const matchingVouchers = orders.flatMap(order =>
    order.statusUse !== true
      ? order.vouchers
          .filter(voucher => voucher.code.replace(/[^A-Z0-9]/g, '') === formattedCode)
          .map(voucher => ({ ...voucher, _parentOrder: order }))
      : []
  );
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
  // If expired and unused, set amountToRedeem to afterExpiredPrice.
  let safeExpire = voucher?.expire ? voucher.expire.replace(' ', 'T') : null;
  let expireDate = safeExpire ? new Date(safeExpire) : null;
  let isExpired = expireDate && !isNaN(expireDate.getTime()) && expireDate < new Date();
  let isUsed = voucher?.statusUse || voucher?.used || voucher?.status === 'USED';
  if (isExpired && !isUsed && voucher.afterExpiredPrice) {
    setAmountToRedeem(voucher.afterExpiredPrice);
  } else {
    setAmountToRedeem("");
  }
  setSelectedVoucher(voucher);
  setIsGiftCard(false);
  setShowPopup(true);
};

// Handle use gift card.
const handleUseGiftCard = (giftCard, order) => {
  const safeId = giftCard.id ? giftCard.id : (typeof giftCard.code === 'string' ? giftCard.code : undefined);
  setSelectedVoucher({
    id: safeId,
    orderNumber: giftCard.code,
    ...giftCard,
    totalPrice: giftCard.totalPrice,
    remainingBalance: giftCard.remainingBalance,
    orderId: order.id,
    location: order.location,
    cashHistory: giftCard.cashHistory || [],
  });
  setIsGiftCard(true);
  setShowPopup(true);
};

// Handle redeem gift card.
const handleRedeemGiftCard = async () => {
    if (!selectedVoucher || !amountToRedeem || !employeeName) { toast.info("Please enter amount and name."); return;}
    if (isRedeeming) return;
    setIsRedeeming(true);
    try {
      const locationName = localStorage.getItem("name");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou/redeem`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: selectedVoucher.code, redeemAmount: parseFloat(amountToRedeem), locationUsed: [locationName], redeemedAt: [new Date().toISOString()], useDate: new Date().toISOString(), username: employeeName}),}
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Gift redeemed successfully!");
        setGiftCardOrders(prevOrders =>
  prevOrders.map(order =>
    order.vouchers.some(v => v.code === data.updatedVoucher.code)
      ? {
          ...order,
          vouchers: order.vouchers.map(v =>
            v.code === data.updatedVoucher.code ? data.updatedVoucher : v
          ),
          remainingBalance: order.remainingBalance - amountToRedeem
        }
      : order
  )
);
        // Refresh all orders to ensure UI is in sync with backend
        await refreshOrders();
        closePopup();
      } else {
        toast.error(data.error || "Failed to redeem.");
      }
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      toast.error("Error redeeming gift card.");
    } finally {
      setIsRedeeming(false);
    }
  };
// Handle mark voucher as used.
const handleMarkVoucherAsUsed = async () => {
    if (!selectedVoucher || !employeeName) { toast.info("Please enter name."); return;}
    if (isRedeeming) return;
    setIsRedeeming(true);
    try {
      const locationName = localStorage.getItem("name");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou/redeems`,{ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({code: selectedVoucher.code, locationUsed: [locationName], redeemedAt: [new Date().toISOString()], useDate: new Date().toISOString(), username: employeeName}),});
      const data = await response.json();

      if (response.ok) {
        toast.success("Voucher used successfully!");
        setOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.vouchers?.some((v) => v.code === selectedVoucher.code) 
              ? { ...order,  statusUse: true, vouchers: order.vouchers.map(v => v.code === data.updatedVoucher.code ? data.updatedVoucher : v) } : order
          )
        );
        // Refresh orders so the filtered lists (used/valid) update immediately
        await refreshOrders();
        closePopup();
      } else {
        toast.error(data.error || "Failed to mark voucher as used.");
      }
    } catch (error) {
      console.error("Error marking voucher as used:", error);
      toast.error("Error marking voucher as used.");
    } finally {
      setIsRedeeming(false);
    }
};


// Close popup.
const closePopup = () => { setShowPopup(false); setSelectedVoucher(null); setSelectedLocation("Select your location"); setAmountToRedeem(""); setIsGiftCard(false); setWasAmountReduced(false); setEmployeeName("");};
const closeSearchPopup = () => { setShowSearchPopup(false); setVoucherSearchCode(""); setSearchQuery(""); setVoucherValidation({ status: null, message: "Enter 4-digit code format (XXXX-XXXX)", color: "#fff"});};
const closeGiftCardSearchPopup = () => { setShowGiftCardSearchPopup(false); setGiftCardSearchCode(""); setSearchQuery(""); setFilteredGiftCardOrders([]);  setGiftCardValidation({ status: null, message: "Enter 11-character code format (XXXXX-XXXXX)", color: "#fff"});};

// For vouchers, show USED status by default.
useEffect(() => {
  // Only run this effect if not in the middle of a search popup (i.e., let handleVoucherSearch control filteredOrders)
  if (showSearchPopup) return;
  if (!searchQuery.trim()) {
    // Only show orders where at least one voucher is redeemed
    const usedVouchers = orders
      .map(order => {
        const redeemedVouchers = order.vouchers.filter(voucher => voucher.statusUse || voucher.used || voucher.status === 'USED');
        if (redeemedVouchers.length > 0) {
          return { ...order, vouchers: redeemedVouchers };
        }
        return null;
      })
      .filter(Boolean);
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

// If a location is selected, filter only by the values shown in the Location column.
// The Location column is rendered from `voucher.locationUsed` (an array). We will only
// inspect that array (if present) and match either whole numeric tokens or substring
// (case-insensitive) for non-numeric needles.
const locationFilteredOrders =
  selectedLocation && selectedLocation !== "" && selectedLocation !== "Select your location"
    ? filteredOrders
        .map(order => {
          const rawNeedle = String(selectedLocation || '').trim();
          if (!rawNeedle) return null;
          const needleLower = rawNeedle.toLowerCase();
          const isNumericNeedle = /^\d+$/.test(rawNeedle);
          const wordRegex = new RegExp(`\\b${escapeRegExp(rawNeedle)}\\b`, 'i');
          const matchingVouchers = (order.vouchers || []).filter(voucher => {
            try {
              if (!Array.isArray(voucher.locationUsed) || voucher.locationUsed.length === 0) return false;
              if (isNumericNeedle) {
                return voucher.locationUsed.some(loc => wordRegex.test(String(loc)));
              }
              return voucher.locationUsed.some(loc => String(loc).toLowerCase().includes(needleLower));
            } catch (e) {
              return false;
            }
          });
          if (matchingVouchers.length === 0) return null;
          return { ...order, vouchers: matchingVouchers };
        })
        .filter(Boolean)
    : filteredOrders;

// Debug: print matching locations so we can inspect what's being filtered.
if (typeof window !== 'undefined') {
  try {
    const matchedLocationValues = locationFilteredOrders
      .flatMap(order => order.vouchers.flatMap(v => Array.isArray(v.locationUsed) ? v.locationUsed : []))
      .map(v => String(v));
    const uniqueMatched = Array.from(new Set(matchedLocationValues));
    console.log('[LocationFilter] selectedLocation=', selectedLocation, 'matchedOrderCount=', locationFilteredOrders.length, 'uniqueMatchedLocations=', uniqueMatched);
  } catch (e) {
    console.log('[LocationFilter] debug error', e);
  }
}

    const now = new Date();

// Date filtering logic for vouchers
const dateFilteredOrders = selectedDateRange
  ? locationFilteredOrders.filter(order => {
      // Use createdAt for custom date, processedAt for others
      if (selectedDateRange === "custom") {
        if (!order.createdAt) return false;
        if (!customStartDate || !customEndDate) return true; // If not both dates picked, show all
        const orderDate = new Date(order.createdAt);
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        // Set end to end of day
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      if (selectedDateRange === "all") {
        return true;
      }
      if (!order.processedAt) return false;
      const orderDate = new Date(order.processedAt);
      switch (selectedDateRange) {
        case "1d": return (now - orderDate) <= 24 * 60 * 60 * 1000;
        case "1w": return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
        case "1m": return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
        case "6m": return (now - orderDate) <= 182 * 24 * 60 * 60 * 1000;
        case "1y": return (now - orderDate) <= 365 * 24 * 60 * 60 * 1000;
        default: return true;
      }
    })
  : locationFilteredOrders;

// Date filtering logic for gift cards
const dateFilteredGiftCardOrders = selectedDateRange
  ? filteredGiftCardOrders.filter(order => {
      if (selectedDateRange === "custom") {
        if (!order.createdAt) return false;
        if (!customStartDate || !customEndDate) return true;
        const orderDate = new Date(order.createdAt);
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      if (selectedDateRange === "all") {
        return true;
      }
      if (!order.processedAt) return false;
      const orderDate = new Date(order.processedAt);
      switch (selectedDateRange) {
        case "1d": return (now - orderDate) <= 24 * 60 * 60 * 1000;
        case "1w": return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
        case "1m": return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
        case "6m": return (now - orderDate) <= 182 * 24 * 60 * 60 * 1000;
        case "1y": return (now - orderDate) <= 365 * 24 * 60 * 60 * 1000;
        default: return true;
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
  <option value="">Purchase Date</option>
  <option value="custom">Custom Date</option>
  <option value="all">All Time</option>
  <option value="1d">Last Day</option>
  <option value="1w">Last Week</option>
  <option value="1m">Last Month</option>
  <option value="6m">Last 6 Months</option>
  <option value="1y">Last 1 Year</option>
</select>
{/* Show custom date pickers if 'Custom Date' is selected */}
{selectedDateRange === "custom" && (
<>
        <RangePicker
          value={customStartDate && customEndDate ? [customStartDate ? dayjs(customStartDate) : null, customEndDate ? dayjs(customEndDate) : null] : []}
          onChange={dates => {
            setCustomStartDate(dates && dates[0] ? dates[0].format('YYYY-MM-DD') : "");
            setCustomEndDate(dates && dates[1] ? dates[1].format('YYYY-MM-DD') : "");
          }}
          style={{ marginLeft: 8, marginRight: 4, minWidth: 220 }}
          allowClear
          format="YYYY-MM-DD"
        />
</>
)}
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
  <option value="">Purchase Date</option>
  <option value="custom">Custom Date</option>
  <option value="all">All Time</option>
  <option value="1d">Last Day</option>
  <option value="1w">Last Week</option>
  <option value="1m">Last Month</option>
  <option value="6m">Last 6 Months</option>
  <option value="1y">Last 1 Year</option>
</select>
{selectedDateRange === "custom" && (
  <>
        <input
          type="date"
          value={customStartDate}
          onChange={e => setCustomStartDate(e.target.value)}
          style={{ ...styles.filterButton, padding: "6px", marginLeft: 8, marginRight: 4 }}
        />
        <span style={{ margin: '0 4px' }}>to</span>
        <input
          type="date"
          value={customEndDate}
          onChange={e => setCustomEndDate(e.target.value)}
          style={{ ...styles.filterButton, padding: "6px", marginLeft: 4 }}
        />
  </>
)}
<input type="text" placeholder="Search Code (XXXXX-XXXXX)" value={searchQuery} maxLength={11} onChange={(e) => { let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (val.length > 10) val = val.slice(0, 10); if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5); setSearchQuery(val);}} onFocus={() => setShowGiftCardSearchPopup(true)}  style={styles.searchInput}/>
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
                        const isUsed = order.statusUse === true || voucher.status === "USED" || voucher.used || voucher.statusUse === true;
                        const safeExpire = voucher?.expire ? voucher.expire.replace(' ', 'T') : null;
                        const expireDate = safeExpire ? new Date(safeExpire) : null;
                        const isExpired = expireDate && !isNaN(expireDate.getTime()) && expireDate < new Date();
                        const safeCreated = voucher?.createdAt ? voucher.createdAt.replace(' ', 'T') : null;
                        let locationDisplay = "—";
                        if (voucher.locationUsed && Array.isArray(voucher.locationUsed) && voucher.locationUsed.length > 0) {
                          locationDisplay = voucher.locationUsed.map((loc, idx) => (<div key={idx}>{loc}</div>));
                        }
                        return {
                          key: voucher.id,
                          product: voucher.productTitle || "—",
                          code: voucher.code || "—",
                          value: `$${formatDollarAmount(voucher.totalPrice || "—")}`,
                          purchaseDate: safeCreated ? (() => {
                            const date = new Date(safeCreated);
                            if (isNaN(date.getTime())) return "—";
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const dd = String(date.getDate()).padStart(2, "0");
                            const yyyy = date.getFullYear();
                            return `${mm}/${dd}/${yyyy}`;
                          })() : "—",
                          expire: safeExpire ? (() => {
                            const date = new Date(safeExpire);
                            if (isNaN(date.getTime())) return "—";
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const dd = String(date.getDate()).padStart(2, "0");
                            const yyyy = date.getFullYear();
                            return `${mm}/${dd}/${yyyy}`;
                          })() : "—",
                          location: locationDisplay,
                          useDate: formatDates(voucher.redeemedAt) || "—",
                          expiredValue: (voucher.afterExpiredPrice !== undefined && voucher.afterExpiredPrice !== null && voucher.afterExpiredPrice !== "")
                            ? `$${formatDollarAmount(voucher.afterExpiredPrice)}`
                            : "—",
                          status: isUsed ? "USED" : (isExpired ? "EXPIRED" : "VALID"),
                          usedBy: voucher.username?.length ? voucher.username.map((user, idx) => <div key={idx}>{user}</div>) : "—",
                          action: { isUsed: isUsed, isExpired: isExpired, voucher, order },
                        };
                      })
                    )
                  : dateFilteredGiftCardOrders.flatMap((order, index) =>
                      order.vouchers.map((giftCard, vIndex) => {
                        if (!giftCard || typeof giftCard !== 'object') return null;
                        let locationDisplay = "—";
                        if (giftCard.locationUsed && Array.isArray(giftCard.locationUsed) && giftCard.locationUsed.length > 0) {
                          locationDisplay = giftCard.locationUsed.map((loc, idx) => (<div key={idx}>{loc}</div>));
                        }
                        const safeId = (typeof giftCard?.id === 'string' && giftCard.id.length > 0)
                          ? giftCard.id
                          : (typeof giftCard?.code === 'string' && giftCard.code.length > 0)
                            ? giftCard.code
                            : `giftcard-${vIndex}`;
                        return {
                          key: safeId,
                          product: giftCard.productTitle ? giftCard.productTitle : "—",
                          code: giftCard.code ? giftCard.code : "—",
                          value: `$${formatDollarAmount(giftCard.totalPrice != null ? giftCard.totalPrice : 0)}`,
                          history: Array.isArray(giftCard.cashHistory) && giftCard.cashHistory.length > 0
                            ? giftCard.cashHistory.map((amt, idx) => <div key={idx}>${formatDollarAmount(amt)}</div>)
                            : "—",
                          remainingBalance: giftCard.remainingBalance != null ? `$${formatDollarAmount(giftCard.remainingBalance)}` : "—",
                          location: locationDisplay,
                          useDate: formatDates(giftCard.redeemedAt ? giftCard.redeemedAt : null) || "—",
                          usedBy: Array.isArray(giftCard.username) && giftCard.username.length > 0
                            ? giftCard.username.map((user, idx) => <div key={idx}>{user}</div>)
                            : "—",
                          action: { used: giftCard.remainingBalance === 0 && giftCard.remainingBalance !== null, giftCard: { ...giftCard, id: safeId }, order, id: safeId },
                        };
                      }).filter(Boolean)
                    )
                }
                columns={activeTab === "vouchers"
                  ? [
                      { title: "Product", dataIndex: "product", key: "product" },
                      { title: "Code", dataIndex: "code", key: "code" },
                      { title: "Price", dataIndex: "value", key: "value" },
                      { title: "Purchase Date", dataIndex: "purchaseDate", key: "purchaseDate" },
                      { title: "Expiration Date", dataIndex: "expire", key: "expire" },
                      { title: "Location", dataIndex: "location", key: "location" },
                      { title: "Use Date", dataIndex: "useDate", key: "useDate" },
                      { title: "Expired Value", dataIndex: "expiredValue", key: "expiredValue" },
                      { title: "Status", dataIndex: "status", key: "status" },
                      { title: "Employee Name", dataIndex: "usedBy", key: "usedBy" },
                      {
                        title: "",
                        dataIndex: "action",
                        key: "action",
                        render: (action) => {
                          const voucher = action.voucher;
                          let safeExpire = voucher?.expire ? voucher.expire.replace(' ', 'T') : null;
                          let expireDate = safeExpire ? new Date(safeExpire) : null;
                          let isExpired = expireDate && !isNaN(expireDate.getTime()) && expireDate < new Date();
                          let isUsed = voucher?.statusUse || voucher?.used || voucher?.status === 'USED';
                          // Enable button if not used, or if expired and not used.
                          const canUse = !isUsed || (isExpired && !isUsed);
                          return (
                            <div style={styles.buttonContainer}>
                              <button className="custom-use-btn" onClick={() => { if (canUse) handleUseVoucher(voucher, action.order); }} disabled={!canUse}>Use</button>
                            </div>
                          );
                        },
                      },
                    ]
                  : [
                      { title: "Product", dataIndex: "product", key: "product" },
                      { title: "Code", dataIndex: "code", key: "code" },
                      { title: "Value", dataIndex: "value", key: "value" },
                      { title: "Usage History", dataIndex: "history", key: "history", render: (_, record) => {
                        const giftCard = record.action.giftCard;
                        if (!giftCard || !Array.isArray(giftCard.cashHistory) || giftCard.cashHistory.length === 0) { return "—"; }
                        return giftCard.cashHistory.map((amt, idx) => <div key={idx}>${formatDollarAmount(amt)}</div>);
                      }},
                      { title: "Remaining Balance", dataIndex: "remainingBalance", key: "remainingBalance", render: (_, record) => {
                        const giftCard = record.action.giftCard;
                        return giftCard && giftCard.remainingBalance != null ? `$${formatDollarAmount(giftCard.remainingBalance)}` : "—";
                      }},
                      { title: "Location", dataIndex: "location", key: "location" },
                      { title: "Use Date", dataIndex: "useDate", key: "useDate" },
                      { title: "Employee Name", dataIndex: "usedBy", key: "usedBy" },
                      { title: "", dataIndex: "action", key: "action",
                        render: (action) => {
                          const giftCard = action.giftCard;
                          const showUseBtn = giftCard && (giftCard.remainingBalance === null || giftCard.remainingBalance > 0);
                          const isDisabled = giftCard && giftCard.remainingBalance === 0 && giftCard.remainingBalance !== null;
                          return (
                            <div style={styles.buttonContainer}>
                              {showUseBtn && (
                                <button className="custom-use-btn" onClick={() => handleUseGiftCard({...giftCard, id: action.id}, action.order)} disabled={isDisabled}>Use</button>
                              )}
                            </div>
                          );
                        },
                      },
                    ]
                }
                pagination={false}
                scroll={{ x: true, y: 500 }}
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
                <input  type="text"  ref={voucherPopupInputRef} value={voucherSearchCode} onChange={(e) => { const formatted = formatVoucherCode(e.target.value.toUpperCase()); setVoucherSearchCode(formatted);}} onPaste={async (e) => { try { await refreshOrders(); } catch (err) { console.error(err); } }} placeholder="XXXX-XXXX" style={styles.popupInput(isMobile)} maxLength={9} />
                {/* Dynamic validation message with color */}
                <span style={{ ...styles.validationText(isMobile), color: voucherValidation.color, fontWeight: voucherValidation.status ? '500' : 'normal'}}> ● {voucherValidation.message}</span>
              </div>

              <div style={styles.redemButt}>
                {(() => {
                  const canSearch = voucherValidation.status === 'valid' || voucherValidation.status === 'expired';
                  return (
                    <button
                      onClick={handleVoucherSearch}
                      style={{
                        ...styles.redeemButts(isMobile),
                        opacity: canSearch ? 1 : 0.5,
                        cursor: canSearch ? 'pointer' : 'not-allowed'
                      }}
                      disabled={!canSearch}
                    >
                      Search
                    </button>
                  );
                })()}
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
                <input type="text" ref={giftCardPopupInputRef} value={giftCardSearchCode}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    if (val.length > 10) val = val.slice(0, 10);
                    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
                    setGiftCardSearchCode(val);
                  }}
                  onPaste={async (e) => { try { await refreshOrders(); } catch (err) { console.error(err); } }}
                  placeholder="XXXXX-XXXXX" style={styles.popupInput(isMobile)} maxLength={11} />
          {/* Dynamic validation message with color */}
          <span style={{...styles.validationText(isMobile), color: giftCardValidation.color, fontWeight: giftCardValidation.status ? '500' : 'normal'}}> ● {giftCardValidation.message}</span>
        </div>
        <div style={styles.redemButt}>
          <button onClick={handleGiftCardSearch}style={{...styles.redeemButts(isMobile), opacity: giftCardValidation.status === 'valid' ? 1 : 0.5, cursor: giftCardValidation.status === 'valid' ? 'pointer' : 'not-allowed'}}disabled={giftCardValidation.status !== 'valid'}>Search</button>
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
                {/* Show status/message for the selected voucher */}
                {(() => {
                  if (!selectedVoucher) return null;
                  const safeExpire = selectedVoucher?.expire ? selectedVoucher.expire.replace(' ', 'T') : null;
                  const expireDate = safeExpire ? new Date(safeExpire) : null;
                  const isExpiredLocal = expireDate && !isNaN(expireDate.getTime()) && expireDate < new Date();
                  if (isGiftCard) {
                    return <span style={styles.validationText(isMobile)}>● Valid Gift Card</span>;
                  }
                  if (isExpiredLocal) {
                    const redeemValueRaw = selectedVoucher && (selectedVoucher.afterExpiredPrice != null ? selectedVoucher.afterExpiredPrice : (selectedVoucher.totalPrice != null ? selectedVoucher.totalPrice : null));
                    const redeemValueText = redeemValueRaw != null ? `$${formatDollarAmount(redeemValueRaw)}` : '—';
                    return <span style={{ ...styles.validationText(isMobile), color: '#fd7e14' }}>Voucher code has expired. Voucher is redeemable for a value of: {redeemValueText}</span>;
                  }
                  return <span style={styles.validationText(isMobile)}>● Valid voucher</span>;
                })()}
                
                {/* No explicit expired-price input in popup; the status message above indicates expired-price will be used when applicable */}
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>Amount to Redeem:</span>
                    <input type="text" value={amountToRedeem !== "" ? `$${amountToRedeem}` : ""} onChange={handleAmountChange} placeholder="$XX.XX" style={{...styles.popupInput(isMobile), borderColor: wasAmountReduced ? '#28a745' : styles.popupInput(isMobile).borderColor}}/>
                  </>
                )}
              </div>

              <div style={styles.popupFlexContainers(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>Employee:</span>
                <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Enter name" style={styles.popupInput(isMobile)} required/>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>Remaining Balance:</span>
                    <input type="text" value={selectedVoucher?.remainingBalance != null ? `$${formatDollarAmount(selectedVoucher.remainingBalance)}` : `$${formatDollarAmount(selectedVoucher?.totalPrice || 0)}`} style={styles.popupReadonlyInput(isMobile)}/>
                  </>
                )}
              </div>
              <div style={styles.redemButt}>
                <button onClick={isGiftCard ? handleRedeemGiftCard : handleMarkVoucherAsUsed} style={{...styles.redeemButts(isMobile), cursor: (employeeName.trim() === "" || isRedeeming) ? "not-allowed" : "pointer", opacity: (employeeName.trim() === "" || isRedeeming) ? 0.5 : 1}} disabled={employeeName.trim() === "" || isRedeeming}>
                  {isRedeeming ? 'Loading...' : 'Redeem'}
                </button>
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