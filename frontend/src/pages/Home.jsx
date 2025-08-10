// Imports.
import React, { useState, useEffect } from "react";
import styles from "../styles/home.js";

// Frontend.
const Home = () => {
  // States.
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [voucherValidation, setVoucherValidation] = useState({
    status: null, // 'valid', 'expired', 'invalid', 'used'
    message: "",
    color: "#666"
  });
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftCardOrders, setGiftCardOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredGiftCardOrders, setFilteredGiftCardOrders] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Select your location");
  const [amountToRedeem, setAmountToRedeem] = useState("");
  const [isGiftCard, setIsGiftCard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showGiftCardSearchPopup, setShowGiftCardSearchPopup] = useState(false);
const [giftCardSearchCode, setGiftCardSearchCode] = useState("");
const [giftCardValidation, setGiftCardValidation] = useState({
  status: null, // 'valid', 'expired', 'invalid', 'used'
  message: "",
  color: "#666"
});


  // Handle resize.
  useEffect(() => {
    const handleResize = () => {setIsMobile(window.innerWidth <= 768);};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show search popup when switching to vouchers tab.
  useEffect(() => {
    if (activeTab === "vouchers") {
      setShowSearchPopup(true);
    }
  }, [activeTab]);

  useEffect(() => {
  if (activeTab === "giftcards") {
    setShowGiftCardSearchPopup(true);
  }
}, [activeTab]);

  // Validate voucher in real-time as user types
  useEffect(() => {
    if (!voucherSearchCode.trim()) {
      setVoucherValidation({
        status: null,
        message: "Enter 4-digit code format (XXXX-XXXX)",
        color: "#fff"
      });
      return;
    }

    const formattedCode = voucherSearchCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Find matching voucher
    const matchingOrder = orders.find(order =>
      order.vouchers.some(voucher =>
        voucher.code.replace(/[^A-Z0-9]/g, '') === formattedCode
      )
    );

    if (!matchingOrder) {
      setVoucherValidation({
        status: 'invalid',
        message: "Invalid voucher number",
        color: "#dc3545" // Red
      });
      return;
    }

    const voucher = matchingOrder.vouchers.find(v =>
      v.code.replace(/[^A-Z0-9]/g, '') === formattedCode
    );

    // Check expiration
    const expireDate = matchingOrder.lineItems[0]?.expire;
    if (expireDate) {
      const expirationDate = new Date(expireDate);
      const currentDate = new Date();
      
      if (expirationDate < currentDate) {
        const formattedExpireDate = (() => {
          const date = new Date(expireDate);
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        })();
        
        setVoucherValidation({
          status: 'expired',
          message: `Voucher expired on ${formattedExpireDate}`,
          color: "#fd7e14" // Orange
        });
        return;
      }
    }

    // Voucher is valid
    setVoucherValidation({
      status: 'valid',
      message: "Valid voucher",
      color: "#28a745" // Green
    });

  }, [voucherSearchCode, orders]);

  // Add this useEffect for gift card validation in real-time
useEffect(() => {
  if (!giftCardSearchCode.trim()) {
    setGiftCardValidation({
      status: null,
      message: "Enter 4-digit code format (XXXX-XXXX)",
      color: "#fff"
    });
    return;
  }

  const formattedCode = giftCardSearchCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Find matching gift card
  const matchingOrder = giftCardOrders.find(order =>
    order.vouchers.some(giftCard =>
      giftCard.code.replace(/[^A-Z0-9]/g, '') === formattedCode
    )
  );

  if (!matchingOrder) {
    setGiftCardValidation({
      status: 'invalid',
      message: "Invalid gift card number",
      color: "#dc3545" // Red
    });
    return;
  }

  const giftCard = matchingOrder.vouchers.find(v =>
    v.code.replace(/[^A-Z0-9]/g, '') === formattedCode
  );

  // Check if gift card is already fully used
  if (matchingOrder.remainingBalance === 0) {
    setGiftCardValidation({
      status: 'used',
      message: "Gift card has been fully used",
      color: "#6c757d" // Gray
    });
    return;
  }

  // Check expiration if applicable
  const expireDate = matchingOrder.lineItems[0]?.expire;
  if (expireDate) {
    const expirationDate = new Date(expireDate);
    const currentDate = new Date();
    
    if (expirationDate < currentDate) {
      const formattedExpireDate = (() => {
        const date = new Date(expireDate);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      })();
      
      setGiftCardValidation({
        status: 'expired',
        message: `Gift card expired on ${formattedExpireDate}`,
        color: "#fd7e14" // Orange
      });
      return;
    }
  }

  // Gift card is valid
  setGiftCardValidation({
    status: 'valid',
    message: "Valid gift card",
    color: "#28a745" // Green
  });

}, [giftCardSearchCode, giftCardOrders]);

// Add this useEffect to filter gift card orders based on search
// useEffect(() => {
//   if (!searchQuery.trim()) {
//     setFilteredGiftCardOrders(giftCardOrders);
//   } else {
//     const filtered = giftCardOrders.filter((order) => 
//       order.vouchers.some((giftCard) => 
//         giftCard.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
//         order.shopifyOrderId.includes(searchQuery)
//       )
//     );
//     setFilteredGiftCardOrders(filtered);
//   }
// }, [searchQuery, giftCardOrders]);

// Update the existing useEffect that sets filteredOrders to also set filteredGiftCardOrders
// useEffect(() => {
//   setFilteredGiftCardOrders(giftCardOrders);
// }, [giftCardOrders]);

// Add this new function for gift card search
const handleGiftCardSearch = () => {
  if (!giftCardSearchCode.trim()) {
    alert("Please enter a gift card code");
    return;
  }

  // Only allow search if gift card is valid
  if (giftCardValidation.status !== 'valid') {
    alert(giftCardValidation.message);
    return;
  }

  const formattedCode = giftCardSearchCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  const filtered = giftCardOrders.filter((order) =>
    order.vouchers.some((giftCard) =>
      giftCard.code.replace(/[^A-Z0-9]/g, '') === formattedCode
    )
  );

  setFilteredGiftCardOrders(filtered);
  setSearchQuery(giftCardSearchCode);
  setShowGiftCardSearchPopup(false);
};

// Update the handleTabChange function
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchQuery(""); // Clear search
  setFilteredOrders([]); // Clear voucher results
  setFilteredGiftCardOrders([]); // Clear gift card results
  
  if (tab === "vouchers") {
    setShowSearchPopup(true);
  } else if (tab === "giftcards") {
    setShowGiftCardSearchPopup(true);
  }
};

// const handleTabChange = (tab) => {
//   setActiveTab(tab);
//   if (tab === "vouchers") {
//     setShowSearchPopup(true);
//   } else if (tab === "giftcards") {
//     setShowGiftCardSearchPopup(true);
//   }
// };

// Add this new function to close gift card search popup
// const closeGiftCardSearchPopup = () => {
//   setShowGiftCardSearchPopup(false);
//   setGiftCardSearchCode("");
//   setGiftCardValidation({
//     status: null,
//     message: "Enter 4-digit code format (XXXX-XXXX)",
//     color: "#666"
//   });
// };

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

  // Fetch orders with vouchers.
  useEffect(() => {
    const fetchOrdersWithVouchers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou`);
        const data = await response.json();
        console.log("📦 Orders with Vouchers:", data);

        // Filter orders with type voucher.
        const voucherOrders = data.filter((order) =>
          order.lineItems.some((item) => item.type === '["voucher"]')
        );

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
        const giftOrders = data.filter((order) =>
          order.lineItems.some((item) => item.type === '["gift"]')
        );

        console.log("🎟️ Filtered Gift Card Orders:", giftOrders);
        setGiftCardOrders(giftOrders);
      } catch (error) {
        console.error("❌ Failed to fetch gift card orders:", error);
      }
    };

    fetchOrdersWithGiftCards();
  }, []);

  // Filter orders based on search query
  // useEffect(() => {
  //   if (!searchQuery.trim()) {
  //     setFilteredOrders(orders);
  //   } else {
  //     const filtered = orders.filter((order) => 
  //       order.vouchers.some((voucher) => 
  //         voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
  //         order.shopifyOrderId.includes(searchQuery)
  //       )
  //     );
  //     setFilteredOrders(filtered);
  //   }
  // }, [searchQuery, orders]);

  // Handle voucher code search from popup.
  const handleVoucherSearch = () => {
    if (!voucherSearchCode.trim()) {
      alert("Please enter a voucher code");
      return;
    }

    // Only allow search if voucher is valid
    if (voucherValidation.status !== 'valid') {
      alert(voucherValidation.message);
      return;
    }

    const formattedCode = voucherSearchCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const filtered = orders.filter((order) =>
      order.vouchers.some((voucher) =>
        voucher.code.replace(/[^A-Z0-9]/g, '') === formattedCode
      )
    );

    setFilteredOrders(filtered);
    setSearchQuery(voucherSearchCode);
    setShowSearchPopup(false);
  };

  // Handle tab change.
  // const handleTabChange = (tab) => {
  //   setActiveTab(tab);
  //   if (tab === "vouchers") {
  //     setShowSearchPopup(true);
  //   }
  // };

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
    });
    setIsGiftCard(true);
    setShowPopup(true);
  };

  const handleRedeemGiftCard = async () => {
    if (
      !selectedVoucher ||
      !amountToRedeem ||
      selectedLocation === "Select your location"
    ) {
      alert("Please enter amount and select a location.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vou/redeem`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: selectedVoucher.code, 
            redeemAmount: parseFloat(amountToRedeem), 
            locationUsed: selectedLocation, 
            redeemedAt: new Date().toISOString(), 
            useDate: new Date().toISOString()
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Redeemed successfully!");
        setGiftCardOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.id === data.updatedOrder.id 
              ? {
                  ...order, 
                  remainingBalance: data.updatedOrder.remainingBalance, 
                  locationUsed: data.updatedOrder.locationUsed, 
                  redeemedAt: data.updatedOrder.redeemedAt
                } 
              : order
          )
        );
        closePopup();
      } else {
        alert(data.error || "Failed to redeem.");
      }
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      alert("Error redeeming gift card.");
    }
  };

  const handleMarkVoucherAsUsed = async () => {
    if (!selectedVoucher || !selectedLocation || selectedLocation === "Select your location") {
      alert("Please select a location.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vou/redeems`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({code: selectedVoucher.code, locationUsed: selectedLocation}),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Voucher marked as used successfully!");
        setOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.vouchers?.some((v) => v.code === selectedVoucher.code) 
              ? {
                  ...order, 
                  statusUse: true, 
                  locationUsed: selectedLocation, 
                  redeemedAt: new Date().toISOString()
                } 
              : order
          )
        );
        closePopup();
      } else {
        alert(data.error || "Failed to mark voucher as used.");
      }
    } catch (error) {
      console.error("Error marking voucher as used:", error);
      alert("Error marking voucher as used.");
    }
  };

  // Close popup.
  const closePopup = () => {
    setShowPopup(false);
    setSelectedVoucher(null);
    setSelectedLocation("Select your location");
    setAmountToRedeem("");
    setIsGiftCard(false);
  };

  // Close search popup.
  const closeSearchPopup = () => {
  setShowSearchPopup(false);
  setVoucherSearchCode("");
  setSearchQuery("");
  setFilteredOrders([]); // Clear results
  setVoucherValidation({
    status: null,
    message: "Enter 4-digit code format (XXXX-XXXX)",
    color: "#666"
  });
};

const closeGiftCardSearchPopup = () => {
  setShowGiftCardSearchPopup(false);
  setGiftCardSearchCode("");
  setSearchQuery("");
  setFilteredGiftCardOrders([]); // Clear results
  setGiftCardValidation({
    status: null,
    message: "Enter 4-digit code format (XXXX-XXXX)",
    color: "#666"
  });
};
  // const closeSearchPopup = () => {
  //   setShowSearchPopup(false);
  //   setVoucherSearchCode("");
  //   setVoucherValidation({
  //     status: null,
  //     message: "Enter 4-digit code format (XXXX-XXXX)",
  //     color: "#666"
  //   });
  // };

  // For vouchers - update existing useEffect
useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredOrders([]); // Show nothing when no search
  } else {
    const filtered = orders.filter((order) => 
      order.vouchers.some((voucher) => 
        voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.shopifyOrderId.includes(searchQuery)
      )
    );
    setFilteredOrders(filtered);
  }
}, [searchQuery, orders]);


// Add this useEffect for gift card search filtering
useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredGiftCardOrders([]); // Show nothing when no search
  } else {
    const filtered = giftCardOrders.filter((order) => 
      order.vouchers.some((giftCard) => 
        giftCard.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.shopifyOrderId.includes(searchQuery)
      )
    );
    setFilteredGiftCardOrders(filtered);
  }
}, [searchQuery, giftCardOrders]);



  return (
    <div style={styles.mainContainer(isMobile)}>
      <div style={styles.contentContainer(isMobile)}>
        {/* Sort and Filter */}
        <h2 style={styles.sortFilterHeader}>Sort and Filter 🏡</h2>

        {/* Filter Buttons */}
        <div style={styles.filterButtonsRow}>
          <div style={styles.filterEmptySpace(isMobile)}></div>
          <div style={styles.filterButtonsGrid(activeTab, isMobile)}>
            {activeTab === "vouchers" ? (
              <>
                <button style={styles.filterButton}>Purchase Date</button>
                <button style={styles.filterButton}>Location</button>
                <button style={styles.filterButton}>Status</button>
                <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
              </>
            ) : (
              <>
                <button style={styles.filterButton}>Purchase Date</button>
                <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
              </>
            )}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div style={styles.mobileTabsContainer(isMobile)}>
          <button onClick={() => handleTabChange("vouchers")} style={styles.mobileTab(activeTab === "vouchers")}>
            Vouchers
          </button>
          <button onClick={() => handleTabChange("giftcards")} style={styles.mobileTab(activeTab === "giftcards")}>
            Gift Cards
          </button>
        </div>

        {/* Main Content Layout */}
        <div style={styles.mainContentLayout(isMobile)}>
          {/* Left Side Tabs */}
          <div style={styles.leftTabsContainer(isMobile)}>
            <button onClick={() => handleTabChange("vouchers")} style={styles.leftTab(activeTab === "vouchers")}>
              Vouchers
            </button>
            <button onClick={() => handleTabChange("giftcards")} style={styles.leftTab(activeTab === "giftcards")}>
              Gift Cards
            </button>
          </div>

          {/* Right Side Content */}
          <div style={styles.rightSideContent}>
            <div style={styles.tableContainer}>
              {/* Header */}
              <div style={styles.tableHeaderContainer(isMobile)}>
                <div style={styles.tableHeader(activeTab, isMobile)}>
                  {activeTab === "vouchers" ? (
                    <>
                      <div>Order Number</div>
                      <div>Expiration</div>
                      <div>Location Used</div>
                      <div>Use Date</div>
                      <div>Status</div>
                      <div></div>
                    </>
                  ) : (
                    <>
                      <div>Gift Card Code</div>
                      <div>Value</div>
                      <div>Remaining Value</div>
                      <div>Location Used</div>
                      <div>Use Date</div>
                      <div></div>
                    </>
                  )}
                </div>
              </div>

              {/* Table Rows */}
              {activeTab === "vouchers"
                ? filteredOrders.map((order, index) =>
                    order.vouchers.map((voucher, vIndex) => (
                      <div key={voucher.id} style={styles.tableRowContainer(index + vIndex, filteredOrders.length, isMobile)}>
                        <div style={styles.tableRow(activeTab, isMobile)}>
                          <div>{voucher.code}</div>
                          <div>{order.lineItems[0]?.expire ? (() => {
                            const date = new Date(order.lineItems[0].expire);
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const dd = String(date.getDate()).padStart(2,"0");
                            const yyyy = date.getFullYear();
                            return `${mm}/${dd}/${yyyy}`;
                          })() : "--"}</div>
                          <div>{order.locationUsed || "—"}</div>
                          <div>{order.redeemedAt ? new Date(order.redeemedAt).toLocaleDateString() : "—"}</div>
                          <div>{order.statusUse ? "USED" : "VALID"}</div>
                          <div style={styles.buttonContainer}>
                            {!voucher.used && (
                              <button onClick={() => handleUseVoucher(voucher)} style={styles.useButton(isMobile)}>
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                : filteredGiftCardOrders.map((order, index) =>
                    order.vouchers.map((giftCard, vIndex) => (
                      <div key={giftCard.id} style={styles.tableRowContainer(index + vIndex, filteredGiftCardOrders.length, isMobile)}>
                        <div style={styles.tableRow(activeTab, isMobile)}>
                          <div>{giftCard.code}</div>
                          <div>${order.totalPrice}</div>
                          <div>{order.remainingBalance != null ? `$${order.remainingBalance}` : "—"}</div>
                          <div>{order.locationUsed || "—"}</div>
                          <div>{order.redeemedAt ? new Date(order.redeemedAt).toLocaleDateString(): "—"}</div>
                          <div style={styles.buttonContainer}>
                            {!giftCard.used && (
                              <button onClick={() => handleUseGiftCard(giftCard, order)} style={styles.useButton(isMobile)}>
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                  onChange={(e) => setVoucherSearchCode(e.target.value.toUpperCase())}
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
            onChange={(e) => setGiftCardSearchCode(e.target.value.toUpperCase())}
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
                    <input type="text" value={amountToRedeem !== "" ? `$${amountToRedeem}` : ""} onChange={(e) => {const val = e.target.value.replace(/[^0-9.]/g, ""); setAmountToRedeem(val)}} placeholder="$XX,XX" style={styles.popupInput(isMobile)}/>
                  </>
                )}
              </div>

              <div style={styles.popupFlexContainers(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>Location:</span>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={styles.popupSelect(isMobile)}>
                  <option value="Select your location" disabled>Select your location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name} style={styles.selectOption}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>Remaining Balance:</span>
                    <input type="text" value={selectedVoucher?.remainingBalance != null ? `$${selectedVoucher.remainingBalance}` : `$${selectedVoucher?.totalPrice || "0.00"}`} style={styles.popupReadonlyInput(isMobile)}/>
                  </>
                )}
              </div>
              <div style={styles.redemButt}>
                <button onClick={isGiftCard ? handleRedeemGiftCard : handleMarkVoucherAsUsed} style={styles.redeemButts(isMobile)}>
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;