// Imports.
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "../styles/customer.js";


// Frontend.
const Customer = ({ onLogout }) => {
  // States.
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle resize.
  useEffect(() => {
    const handleResize = () => {setIsMobile(window.innerWidth <= 1100);};
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


  // Fetch orders with vouchers.
//   useEffect(() => {
//     const fetchOrdersWithVouchers = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vou/cust?email=${email}`);
//         const data = await response.json();
//         console.log("📦 Orders with Vouchers:", data);

//         // Filter orders with type voucher.
//         const voucherOrders = data.filter((order) =>
//           order.lineItems.some((item) => item.type === '["voucher"]')
//         );

//         console.log("🎫 Filtered Voucher Orders:", voucherOrders);
//         setOrders(voucherOrders);
//         // setFilteredOrders(voucherOrders);
//       } catch (error) {
//         console.error("❌ Failed to fetch voucher orders:", error);
//       }
//     };

//     fetchOrdersWithVouchers();
//   }, []);





  return (
    <div style={styles.mainContainer(isMobile)}>
     <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.contentContainer(isMobile)}>
        {/* Filter Buttons */}
        <div style={styles.filterButtonsRow}>
          <div style={styles.filterEmptySpace(isMobile)}></div>
          <div style={styles.filterButtonsGrid(activeTab, isMobile)}>
            {activeTab === "vouchers" ? (
              <>
                <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
              </>
            ) : (
              <>
                <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
              </>
            )}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div style={styles.mobileTabsContainer(isMobile)}>
          <button onClick={() => handleTabChange("vouchers")} style={styles.mobileTab(activeTab === "vouchers")}>
            My Vouchers
          </button>
          <button onClick={() => handleTabChange("giftcards")} style={styles.mobileTab(activeTab === "giftcards")}>
            My Gift Cards
          </button>
        </div>

        {/* Main Content Layout */}
        <div style={styles.mainContentLayout(isMobile)}>
          {/* Left Side Tabs */}
          <div style={styles.leftTabsContainer(isMobile)}>
            <button onClick={() => handleTabChange("vouchers")} style={styles.leftTab(activeTab === "vouchers")}>
              My Vouchers
            </button>
            <button onClick={() => handleTabChange("giftcards")} style={styles.leftTab(activeTab === "giftcards")}>
              My Gift Cards
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
                      <div>Order #</div>
                      <div>Gift Card Number</div>
                      <div>Amount Used</div>
                      <div>Remaining Balance</div>
                      <div>Location</div>
                    </>
                  ) : (
                    <>
                      <div>Order #</div>
                      <div>Voucher Code</div>
                      <div>Expiration Date</div>
                      <div>Remaining Balance</div>
                      <div>Location</div>
                    </>
                  )}
                </div>
              </div>

              {/* Table Rows
              {activeTab === "vouchers"
                ? filteredOrders.map((order, index) =>
                    order.vouchers.map((voucher, vIndex) => {
                    const isUsed = order.statusUse === true || voucher.status === "USED";
                  return (
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
                          <div>{formatDates(order.redeemedAt) || "—"}</div>
                          <div>{isUsed ? "USED" : "VALID"}</div>
                      </div>
                    </div>
                    );
                  })
                  )
                : filteredGiftCardOrders.map((order, index) =>
                    order.vouchers.map((giftCard, vIndex) => (
                      <div key={giftCard.id} style={styles.tableRowContainer(index + vIndex, filteredGiftCardOrders.length, isMobile)}>
                        <div style={styles.tableRow(activeTab, isMobile)}>
                          <div>{giftCard.code}</div>
                          <div>${formatDollarAmount(order.totalPrice)}</div>
                          <div>{order.remainingBalance != null ? `$${formatDollarAmount(order.remainingBalance)}` : "—"}</div>
                          <div> {order.locationUsed?.length ? order.locationUsed.map((loc, idx) => ( <div key={idx}>{loc}</div>)): "—"}</div>
                          <div>{formatDates(order.redeemedAt) || "—"}</div>
                        </div>
                      </div>
                    ))
                  )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Customer;