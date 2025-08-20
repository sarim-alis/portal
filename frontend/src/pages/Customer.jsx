// Imports.
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "../styles/customer.js";


// Frontend.
const Customer = ({ onLogout }) => {
  // States.
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [orders, setOrders] = useState([]);
  const [giftOrders, setGiftOrders] = useState([]);

  // Handle resize.
  useEffect(() => {
    const handleResize = () => {setIsMobile(window.innerWidth <= 1100);};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

// Handle tab change.
const handleTabChange = (tab) => {
  setActiveTab(tab);
};

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        console.error("No user email found in localStorage");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vou/cust?email=${email}`
      );
      const data = await response.json();
      console.log("📦 All Orders:", data);

      // ✅ Separate vouchers
      const voucherOrders = data.filter(
        (voucher) =>
          voucher.order?.lineItems?.some(
            (item) => item.type === '["voucher"]'
          )
      );

      // ✅ Separate gifts
      const giftOrders = data.filter(
        (voucher) =>
          voucher.order?.lineItems?.some(
            (item) => item.type === '["gift"]'
          )
      );

      console.log("🎫 Voucher Orders:", voucherOrders);
      console.log("🎁 Gift Orders:", giftOrders);

      setOrders(voucherOrders);
      setGiftOrders(giftOrders);
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
    }
  };

  fetchOrders();
}, []);


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

              {/* Table Rows */}
{activeTab === "vouchers"
  ? orders.map((voucher, index) => {
      const order = voucher.order;
      return (
        <div
          key={voucher.id}
          style={styles.tableRowContainer(index, orders.length, isMobile)}
        >
          <div style={styles.tableRow(activeTab, isMobile)}>
            <div>{order.shopifyOrderId}</div>
            <div>{voucher.code}</div>
            <div>{voucher.used ? "USED" : "VALID"}</div>
            <div>
              {order.remainingBalance != null
                ? `$${order.remainingBalance}`
                : "—"}
            </div>
            <div>
              {order.locationUsed?.length
                ? order.locationUsed.join(", ")
                : "—"}
            </div>
          </div>
        </div>
      );
    })
  : giftOrders.map((gift, index) => {
      const order = gift.order;
      return (
        <div
          key={gift.id}
          style={styles.tableRowContainer(index, giftOrders.length, isMobile)}
        >
          <div style={styles.tableRow(activeTab, isMobile)}>
            <div>{order.shopifyOrderId}</div>
            <div>{gift.code}</div>
            <div>
              {order.lineItems[0]?.expire
                ? new Date(order.lineItems[0].expire).toLocaleDateString()
                : "--"}
            </div>
            <div>
              {order.remainingBalance != null
                ? `$${order.remainingBalance}`
                : "—"}
            </div>
            <div>
              {order.locationUsed?.length
                ? order.locationUsed.join(", ")
                : "—"}
            </div>
          </div>
        </div>
      );
    })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Customer;