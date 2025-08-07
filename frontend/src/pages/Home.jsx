import React, { useState, useEffect } from 'react';
import styles from '../styles/home.js';

const Home = () => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [locations, setLocations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftCardOrders, setGiftCardOrders] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('Select your location');
  const [amountToRedeem, setAmountToRedeem] = useState('');
  const [isGiftCard, setIsGiftCard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // const formatOrderId = (shopifyOrderId) => {
  //   if (!shopifyOrderId) return '';
  //     const id = shopifyOrderId.toUpperCase();
  //     return `${id.slice(0, 4)}-${id.slice(4, 8)}`;
  // };

  const formatOrderId = (shopifyOrderId) => {
    if (!shopifyOrderId) return '';
      const id = shopifyOrderId.toString();
      return id.match(/.{1,4}/g).join('-');
  };



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/loc'); // or your domain
      const data = await response.json();
      console.log('📍 Locations from API:', data.locations);
      setLocations(data.locations);
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error);
    }
  };

  fetchLocations();
}, []);

  useEffect(() => {
    const fetchOrdersWithVouchers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vou');
        const data = await response.json();
        console.log('📦 Orders with Vouchers:', data);
        
        // Filter orders to only show those with voucher type line items.
        const voucherOrders = data.filter(order => 
          order.lineItems.some(item => item.type === '["voucher"]')
        );
        
        console.log('🎫 Filtered Voucher Orders:', voucherOrders);
        setOrders(voucherOrders);
      } catch (error) {
        console.error('❌ Failed to fetch voucher orders:', error);
      }
    };

    fetchOrdersWithVouchers();
  }, []);

  useEffect(() => {
    const fetchOrdersWithGiftCards = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vou');
        const data = await response.json();
        console.log('🎁 Orders with Gift Cards:', data);
        
        // Filter orders to only show those with gift type line items.
        const giftOrders = data.filter(order => 
          order.lineItems.some(item => item.type === '["gift"]')
        );
        
        console.log('🎟️ Filtered Gift Card Orders:', giftOrders);
        setGiftCardOrders(giftOrders);
      } catch (error) {
        console.error('❌ Failed to fetch gift card orders:', error);
      }
    };

    fetchOrdersWithGiftCards();
  }, []);

const handleUseVoucher = (voucher) => {
  setSelectedVoucher(voucher);
  setIsGiftCard(false);
  setShowPopup(true);
};



 const handleUseGiftCard = (giftCard) => {
  setSelectedVoucher({orderNumber: giftCard.code, ...giftCard});
  setIsGiftCard(true);
  setShowPopup(true);
};

  const closePopup = () => {
    setShowPopup(false);
    setSelectedVoucher(null);
    setSelectedLocation('Select your location');
    setAmountToRedeem('');
    setIsGiftCard(false);
  };


  return (
    <div style={styles.mainContainer(isMobile)}>
      <div style={styles.contentContainer(isMobile)}>
        {/* Sort and Filter Header */}
        <h2 style={styles.sortFilterHeader}>
          Sort and Filter 🏡
        </h2>

        {/* Filter Buttons Row - Aligned with table columns */}
        <div style={styles.filterButtonsRow}>
          {/* Empty space for left tabs area - hide on mobile */}
          <div style={styles.filterEmptySpace(isMobile)}></div>
          
          {/* Filter buttons aligned with table columns */}
          <div style={styles.filterButtonsGrid(activeTab, isMobile)}>
            {activeTab === 'vouchers' ? (
              <>
                <button style={styles.filterButton}>
                  Purchase Date
                </button>
                <button style={styles.filterButton}>
                  Location
                </button>
                <button style={styles.filterButton}>
                  Status
                </button>
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
                <button style={styles.filterButton}>
                  Purchase Date
                </button>
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
            onClick={() => setActiveTab('vouchers')}
            style={styles.mobileTab(activeTab === 'vouchers')}
          >
            Vouchers
          </button>
          <button
            onClick={() => setActiveTab('giftcards')}
            style={styles.mobileTab(activeTab === 'giftcards')}
          >
            Gift Cards
          </button>
        </div>

        {/* Main Content Layout */}
        <div style={styles.mainContentLayout(isMobile)}>
          {/* Left Side Tabs - Hide on mobile */}
          <div style={styles.leftTabsContainer(isMobile)}>
            <button
              onClick={() => setActiveTab('vouchers')}
              style={styles.leftTab(activeTab === 'vouchers')}
            >
              Vouchers
            </button>
            <button
              onClick={() => setActiveTab('giftcards')}
              style={styles.leftTab(activeTab === 'giftcards')}
            >
              Gift Cards
            </button>
          </div>

          {/* Right Side Content */}
          <div style={styles.rightSideContent}>

        {/* Data Table */}
        <div style={styles.tableContainer}>
          {/* Table Header */}
          <div style={styles.tableHeaderContainer(isMobile)}>
            <div style={styles.tableHeader(activeTab, isMobile)}>
              {activeTab === 'vouchers' ? (
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
         {activeTab === 'vouchers' ? (
  orders.map((order, index) => (
    order.vouchers.map((voucher, vIndex) => (
      <div
        key={voucher.id}
        style={styles.tableRowContainer(index + vIndex, orders.length, isMobile)}
      >
        <div style={styles.tableRow(activeTab, isMobile)}>
          <div>{formatOrderId(order.shopifyOrderId)}</div>
          <div>12-29-25</div> {/* Placeholder or calculated expiry */}
          <div>{voucher.locationUsed || '--'}</div>
          <div>{voucher.useDate || '--'}</div>
          <div>{voucher.used ? 'USED' : 'VALID'}</div>
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
  ))
): (
  giftCardOrders.map((order, index) => (
    order.vouchers.map((giftCard, vIndex) => (
      <div
        key={giftCard.id}
        style={styles.tableRowContainer(index + vIndex, giftCardOrders.length, isMobile)}
      >
        <div style={styles.tableRow(activeTab, isMobile)}>
          <div>{giftCard.code}</div>
          <div>${order.totalPrice}</div> {/* Use order total as value */}
          <div>{giftCard.remainingValue || `$${order.totalPrice}`}</div> {/* Remaining value or full amount */}
          <div>{giftCard.locationUsed || '--'}</div>
          <div>{giftCard.useDate || '--'}</div>
          <div style={styles.buttonContainer}>
            {!giftCard.used && (
  <button
    onClick={() => handleUseGiftCard(giftCard)}
    style={styles.useButton(isMobile)}
  >
    Use
  </button>
)}
          </div>
        </div>
      </div>
    ))
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
            <button
              onClick={closePopup}
              style={styles.closeButton}
            >
              ×
            </button>

            {/* Gift Card ID and Amount to Redeem Section */}
            <div style={styles.popupContentContainer}>
              <div style={styles.popupFlexContainer(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>
                  {isGiftCard ? 'Gift Card ID:' : 'Voucher ID:'}
                </span>
                <input
                  type="text"
                  value={selectedVoucher?.code || ''}
                  readOnly
                  style={styles.popupInput(isMobile)}
                />
                <span style={styles.validationText(isMobile)}>
                  ● {isGiftCard ? 'Valid Gift Card' : 'Valid voucher'}
                </span>
                {isGiftCard && (
                  <>
                    <span style={styles.popupLabel(isMobile)}>
                      Amount to Redeem:
                    </span>
                    <input
                      type="text"
                      value={amountToRedeem}
                      onChange={(e) => setAmountToRedeem(e.target.value)}
                      placeholder="$XX,XX"
                      style={styles.popupInput(isMobile)}
                    />
                  </>
                )}
              </div>

              <div style={styles.popupFlexContainer(isMobile)}>
                <span style={styles.popupLabel(isMobile)}>
                  Location:
                </span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={styles.popupSelect(isMobile)}
                >
                  <option value="Select your location" disabled>Select your location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.name} style={styles.selectOption}>
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
                      value={selectedVoucher?.remainingValue || '$0.00'}
                      readOnly
                      style={styles.popupReadonlyInput(isMobile)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
