/* ==========================================================================
   房貸減壓術 - Javascript Application Logic
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 0. Firebase Configuration & Fallback Setup
// ==========================================
// 💡 請在此處填入您的 Firebase 設定以啟動雲端同步功能！
const firebaseConfig = {
  apiKey: "AIzaSyBgcx05ElIGF1qseIryeasXxOgS6KYNtVU",
  authDomain: "haunches-307a4.firebaseapp.com",
  projectId: "haunches-307a4",
  storageBucket: "haunches-307a4.firebasestorage.app",
  messagingSenderId: "424240069442",
  appId: "1:424240069442:web:5d5cd2d9892432495626db"
};

let db = null;
let isFirebaseEnabled = false;

// 驗證 Firebase 設定是否填寫
if (firebaseConfig.projectId && firebaseConfig.projectId !== "") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("Firebase Firestore 雲端資料庫初始化成功！");
  } catch (error) {
    console.error("Firebase 初始化失敗：", error);
  }
} else {
  console.warn("未偵測到 Firebase Config，系統已自動啟用 LocalStorage 本地儲存備用模式。");
}

// 儲存諮詢資料函數
const saveLead = async (leadData) => {
  leadData.status = "待聯絡"; // 預設諮詢狀態為「待聯絡」

  if (isFirebaseEnabled && db) {
    try {
      leadData.timestamp = serverTimestamp(); // 寫入伺服器時間戳記
      await addDoc(collection(db, "leads"), leadData);
      console.log("資料已成功寫入 Firebase Firestore 雲端資料庫！");
      return true;
    } catch (error) {
      console.error("雲端寫入發生錯誤，切換至本地儲存備用：", error);
      saveToLocalStorage(leadData);
      return false;
    }
  } else {
    saveToLocalStorage(leadData);
    return false;
  }
};

// 本地暫存備用方案
const saveToLocalStorage = (leadData) => {
  leadData.timestamp = new Date().toISOString(); // 使用本地時間 ISO 字串
  try {
    const existingLeads = JSON.parse(localStorage.getItem("mortgage_leads") || "[]");
    existingLeads.push(leadData);
    localStorage.setItem("mortgage_leads", JSON.stringify(existingLeads));
    console.log("資料已儲存至瀏覽器 LocalStorage。");
  } catch (error) {
    console.error("LocalStorage 寫入失敗：", error);
  }
};


document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Scroll Progress Bar & Sticky Header
  // ==========================================
  const progressBar = document.getElementById('progressBar');
  const mainHeader = document.querySelector('.main-header');

  const handleScroll = () => {
    // Scroll progress calculation
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolledPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrolledPercent + '%';

    // Sticky header shadow / height change
    if (scrollTop > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Init status check


  // ==========================================
  // 2. Mobile Navigation Drawer Toggle
  // ==========================================
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  
  // Create backdrop element dynamically
  const drawerBackdrop = document.createElement('div');
  drawerBackdrop.className = 'drawer-backdrop';
  document.body.appendChild(drawerBackdrop);

  const toggleMobileMenu = () => {
    mobileNavToggle.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
    drawerBackdrop.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  };

  mobileNavToggle.addEventListener('click', toggleMobileMenu);
  drawerBackdrop.addEventListener('click', toggleMobileMenu);

  // Close drawer when clicking nav links
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });


  // ==========================================
  // 3. Scroll Reveal Animations (IntersectionObserver)
  // ==========================================
  const scrollElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollElements.forEach(el => {
    revealObserver.observe(el);
  });


  // ==========================================
  // 4. Interactive Steps: Staircase & Card Sync
  // ==========================================
  const stepItems = document.querySelectorAll('.step-item');
  const stairBars = document.querySelectorAll('.stair-bar');

  // Activate step logic
  const activateStep = (stepNumber) => {
    // Sync text items
    stepItems.forEach(item => {
      if (parseInt(item.getAttribute('data-step')) === stepNumber) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Sync staircase bars
    stairBars.forEach(bar => {
      if (parseInt(bar.getAttribute('data-step')) === stepNumber) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
  };

  // Hover sync: Hovering step card highlights staircase
  stepItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const step = parseInt(item.getAttribute('data-step'));
      activateStep(step);
    });
  });

  // Hover sync: Hovering staircase highlights step card
  stairBars.forEach(bar => {
    bar.addEventListener('mouseenter', () => {
      const step = parseInt(bar.getAttribute('data-step'));
      activateStep(step);
    });
  });

  // Scroll sync: Automatically highlight the step as it enters viewport center
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = parseInt(entry.target.getAttribute('data-step'));
        activateStep(step);
      }
    });
  }, {
    threshold: 0.6,
    root: null,
    rootMargin: '-10% 0px -40% 0px'
  });

  stepItems.forEach(item => {
    stepObserver.observe(item);
  });


  // ==========================================
  // 5. Checkbox Group Interactivity & Border Accent
  // ==========================================
  const checkboxItems = document.querySelectorAll('.checkbox-item');

  checkboxItems.forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    
    // Sync initial state
    if (checkbox.checked) {
      item.classList.add('checked');
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
      validateCheckboxes();
    });
  });


  // ==========================================
  // 6. Form Validation & CSS :has() Fallbacks
  // ==========================================
  const form = document.getElementById('reliefForm');
  const formGroups = document.querySelectorAll('.form-group');

  // Checkbox group validation helper
  const validateCheckboxes = () => {
    const checkboxes = form.querySelectorAll('input[name="problems"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const groupElement = document.getElementById('problem-checkboxes').closest('.form-group');

    if (checkedCount === 0) {
      groupElement.classList.add('has-checkbox-error');
      return false;
    } else {
      groupElement.classList.remove('has-checkbox-error');
      return true;
    }
  };

  // Generic fallback validator (if CSS :has() is not supported)
  const validateInput = (input) => {
    const group = input.closest('.form-group');
    if (!group) return;

    let isValid = input.checkValidity();

    // Check specific formats
    if (input.id === 'phone' && isValid) {
      const phoneRegex = /^09[0-9]{8}$/;
      isValid = phoneRegex.test(input.value);
    }

    if (input.type === 'number' && isValid) {
      const val = parseFloat(input.value);
      isValid = !isNaN(val) && val >= 0;
    }

    // Toggle error status elements
    if (!isValid) {
      group.classList.add('has-error-fallback');
      input.setAttribute('aria-invalid', 'true');
    } else {
      group.classList.remove('has-error-fallback');
      input.removeAttribute('aria-invalid');
    }

    return isValid;
  };

  // Real-time validation listeners
  form.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('blur', () => {
      validateInput(element);
    });

    element.addEventListener('input', () => {
      const group = element.closest('.form-group');
      if (group && (group.classList.contains('has-error-fallback') || group.matches(':has(:user-invalid)'))) {
        validateInput(element);
      }
    });

    element.addEventListener('change', () => {
      validateInput(element);
    });
  });

  // Keep native aria-invalid synced with CSS :user-invalid state for accessibility
  const syncAria = (el) => {
    if (el.matches) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };
  document.addEventListener('blur', (e) => {
    if (e.target.matches('input, select')) {
      syncAria(e.target);
    }
  }, true);
  document.addEventListener('input', (e) => {
    if (e.target.matches('input, select') && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target);
    }
  });


  // ==========================================
  // 7. Form Submission & Success Popup Modal
  // ==========================================
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const submitBtn = form.querySelector('.submit-btn');
  const submitText = submitBtn.querySelector('span');
  const spinner = submitBtn.querySelector('.loading-spinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isFormValid = true;

    // 1. Validate all inputs
    form.querySelectorAll('input:not([type="checkbox"]), select').forEach(input => {
      const isInputValid = validateInput(input);
      if (!isInputValid) {
        isFormValid = false;
      }
    });

    // 2. Validate checkbox group
    const isCheckboxesValid = validateCheckboxes();
    if (!isCheckboxesValid) {
      isFormValid = false;
    }

    // If invalid, focus the first erroneous input
    if (!isFormValid) {
      const firstError = form.querySelector('.has-error-fallback, :has(:user-invalid), .has-checkbox-error');
      if (firstError) {
        const inputToFocus = firstError.querySelector('input, select');
        if (inputToFocus) inputToFocus.focus();
      }
      return;
    }

    // Form is valid: Trigger loading animation
    submitBtn.disabled = true;
    submitText.textContent = '送出中...';
    spinner.style.display = 'block';

    // 彙整表單資料
    const checkedProblems = [];
    form.querySelectorAll('input[name="problems"]:checked').forEach(cb => {
      checkedProblems.push(cb.value);
    });

    const leadData = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      location: document.getElementById('location').value,
      balance: parseInt(document.getElementById('balance').value),
      monthly: parseInt(document.getElementById('monthly').value),
      problems: checkedProblems,
      contactTime: document.getElementById('contactTime').value
    };

    // 寫入資料庫 (Firebase Firestore 或 LocalStorage)
    await saveLead(leadData);

    // 重設按鈕與顯示成功視窗
    submitBtn.disabled = false;
    submitText.textContent = '預約房貸減壓諮詢';
    spinner.style.display = 'none';

    successModal.classList.add('open');
    document.body.classList.add('no-scroll');

    // 重設表單與狀態
    form.reset();
    checkboxItems.forEach(item => {
      item.classList.remove('checked');
    });
    formGroups.forEach(group => {
      group.classList.remove('has-error-fallback');
      group.classList.remove('has-checkbox-error');
    });
  });

  // Close modal event
  const closeModal = () => {
    successModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  closeModalBtn.addEventListener('click', closeModal);
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });

});
