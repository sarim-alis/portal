// Imports.
import React, { useState, useEffect } from "react";
import styles from "../styles/home.js";

// Frontend.
const Home = () => {
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftCardOrders, setGiftCardOrders] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(
    "Select your location"
  );
  const [amountToRedeem, setAmountToRedeem] = useState("");
  const [isGiftCard, setIsGiftCard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Format order id.
  const formatOrderId = (shopifyOrderId) => {
    if (!shopifyOrderId) return "";
    const id = shopifyOrderId.toString();
    return id.match(/.{1,4}/g).join("-");
  };

  // Handle resize.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch locations.
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/loc`); // or your domain
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
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Redeemed successfully!");

        // Update state so UI shows new remaining balance without refresh
        setGiftCardOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === data.updatedOrder.id
              ? {
                  ...order,
                  remainingBalance: data.updatedOrder.remainingBalance,
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

  // Close popup.
  const closePopup = () => {
    setShowPopup(false);
    setSelectedVoucher(null);
    setSelectedLocation("Select your location");
    setAmountToRedeem("");
    setIsGiftCard(false);
  };

  return (
    <div style={styles.mainContainer(isMobile)}>
      <div style={styles.contentContainer(isMobile)}>
        {/* Sort and Filter */}
        <h2 style={styles.sortFilterHeader}>Sort and Filter 🏡</h2>

        {/* Filter Buttons */}
        <div style={styles.filterButtonsRow}>
          {/* Empty space for left tabs area - hide on mobile */}
          <div style={styles.filterEmptySpace(isMobile)}></div>

          {/* Filter buttons aligned with table columns */}
          <div style={styles.filterButtonsGrid(activeTab, isMobile)}>
            {activeTab === "vouchers" ? (
              <>
                <button style={styles.filterButton}>Purchase Date</button>
                <button style={styles.filterButton}>Location</button>
                <button style={styles.filterButton}>Status</button>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </>
            ) : (
              <>
                <button style={styles.filterButton}>Purchase Date</button>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile Tabs - Show above content on mobile */}
        <div style={styles.mobileTabsContainer(isMobile)}>
          <button
            onClick={() => setActiveTab("vouchers")}
            style={styles.mobileTab(activeTab === "vouchers")}
          >
            Vouchers
          </button>
          <button
            onClick={() => setActiveTab("giftcards")}
            style={styles.mobileTab(activeTab === "giftcards")}
          >
            Gift Cards
          </button>
        </div>

        {/* Main Content Layout */}
        <div style={styles.mainContentLayout(isMobile)}>
          {/* Left Side Tabs - Hide on mobile */}
          <div style={styles.leftTabsContainer(isMobile)}>
            <button
              onClick={() => setActiveTab("vouchers")}
              style={styles.leftTab(activeTab === "vouchers")}
            >
              Vouchers
            </button>
            <button
              onClick={() => setActiveTab("giftcards")}
              style={styles.leftTab(activeTab === "giftcards")}
            >
              Gift Cards
            </button>
          </div>

          {/* Right Side Content */}
          <div style={styles.rightSideContent}>
            {/* Table */}
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
                ? orders.map((order, index) =>
                    order.vouchers.map((voucher, vIndex) => (
                      <div
                        key={voucher.id}
                        style={styles.tableRowContainer(
                          index + vIndex,
                          orders.length,
                          isMobile
                        )}
                      >
                        <div style={styles.tableRow(activeTab, isMobile)}>
                          <div>{formatOrderId(order.shopifyOrderId)}</div>
                          <div>
                            {order.lineItems[0]?.expire
                              ? (() => {
                                  const date = new Date(
                                    order.lineItems[0].expire
                                  );
                                  const mm = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const dd = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const yyyy = date.getFullYear();
                                  return `${mm}/${dd}/${yyyy}`;
                                })()
                              : "--"}
                          </div>
                          <div>{voucher.locationUsed || "—"}</div>
                          <div>{voucher.useDate || "—"}</div>
                          <div>{voucher.used ? "USED" : "VALID"}</div>
                          <div style={styles.buttonContainer}>
                            {!voucher.used && (
                              <button
                                onClick={() => handleUseVoucher(voucher)}
                                style={styles.useButton(isMobile)}
                              >
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                : giftCardOrders.map((order, index) =>
                    order.vouchers.map((giftCard, vIndex) => (
                      <div
                        key={giftCard.id}
                        style={styles.tableRowContainer(
                          index + vIndex,
                          giftCardOrders.length,
                          isMobile
                        )}
                      >
                        <div style={styles.tableRow(activeTab, isMobile)}>
                          <div>{giftCard.code}</div>
                          <div>${order.totalPrice}</div>
                          <div>
                            {order.remainingBalance != null
                              ? `$${order.remainingBalance}`
                              : "—"}
                          </div>
                          <div>{giftCard.locationUsed || "—"}</div>
                          <div>{giftCard.useDate || "—"}</div>
                          <div style={styles.buttonContainer}>
                            {!giftCard.used && (
                              <button
                                onClick={() =>
                                  handleUseGiftCard(giftCard, order)
                                }
                                style={styles.useButton(isMobile)}
                              >
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

      {/* Popup Modal */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupModal(isMobile)}>
            {/* Close button */}
            <button onClick={closePopup} style={styles.closeButton}>
              ×
            </button>

            {/* Redeem Section */}
            <div style={styles.popupContentContainer}>
              <div style={styles.popupFlexContainer(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>
                  {isGiftCard ? "Gift Card ID:" : "Voucher ID:"}
                </span>
                <input
                  type="text"
                  value={selectedVoucher?.code || ""}
                  readOnly
                  style={styles.popupInput(isMobile)}
                />
                <span style={styles.validationText(isMobile)}>
                  ● {isGiftCard ? "Valid Gift Card" : "Valid voucher"}
                </span>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>
                      Amount to Redeem:
                    </span>
                    <input
                      type="text"
                      value={amountToRedeem !== "" ? `$${amountToRedeem}` : ""}
                      onChange={(e) => {const val = e.target.value.replace(/[^0-9.]/g, ""); setAmountToRedeem(val)}}
                      placeholder="$XX,XX"
                      style={styles.popupInput(isMobile)}
                    />     
                  </>
                )}
              </div>

              <div style={styles.popupFlexContainers(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={styles.popupSelect(isMobile)}
                >
                  <option value="Select your location" disabled>
                    Select your location
                  </option>
                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.name}
                      style={styles.selectOption}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>
                      Remaining Balance:
                    </span>
                    <input
                      type="text"
                      value={
                        selectedVoucher?.remainingBalance != null
                          ? `$${selectedVoucher.remainingBalance}`
                          : `$${selectedVoucher?.totalPrice || "0.00"}`
                      }
                      style={styles.popupReadonlyInput(isMobile)}
                    />
                  </>
                )}
              </div>
              <div style={styles.redemButt}>
                <button
                  onClick={handleRedeemGiftCard}
                  style={styles.redeemButts(isMobile)}
                >
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
