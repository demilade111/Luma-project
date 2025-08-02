document.addEventListener("DOMContentLoaded", function () {
  // Initialize offline manager
  import("./offlineManager.js")
    .then(() => {
      console.log("Offline manager initialized");
    })
    .catch((error) => {
      console.error("Failed to initialize offline manager:", error);
    });

  const base = "";
  const componentPaths = {
    mobilenavbar: `${base}/components/mobilenavbar.html`,
    sidebar: `${base}/components/sidebar.html`,
    navbar: `${base}/components/navbar.html`,
    hero: `${base}/components/hero.html`,
    footer: `${base}/components/footer.html`,
  };

  const drawerMenuItems = [
    {
      label: "Home",
      href: "/views/home/index.html",
      svg: `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.8085 35.3021H11.4848C10.6086 35.3021 9.87451 34.5879 9.87451 33.7072C9.87451 32.8264 10.5849 32.1123 11.4848 32.1123H30.7848C31.661 32.1123 32.3951 32.8264 32.3951 33.7072C32.3951 34.5879 31.6847 35.3021 30.7848 35.3021H30.8085Z" fill="white"/>
      <path d="M34.8565 14.4254L25.8814 19.7576L22.0451 6.42726C21.7136 5.28466 20.6243 5.28466 20.2927 6.42726L16.4564 19.7576L7.48133 14.4254C6.69986 13.9732 5.94207 15.1158 6.24992 16.2822L9.80206 29.7791H32.5832L36.1353 16.2822C36.4432 15.1158 35.6617 13.9494 34.9039 14.4254H34.8565ZM24.3659 23.9709L23.1344 25.2563C23.1344 25.2563 23.0871 25.3277 23.0871 25.3754L23.3239 27.1369C23.3713 27.4225 23.0634 27.6367 22.8029 27.5177L21.2163 26.756C21.2163 26.756 21.1216 26.756 21.0979 26.756L19.5113 27.5177C19.2508 27.6367 18.9429 27.4225 18.9903 27.1369L19.2271 25.3754C19.2271 25.3754 19.2271 25.2801 19.1797 25.2563L17.9483 23.9709C17.7352 23.7567 17.8536 23.3996 18.1378 23.352L19.8902 23.0425C19.8902 23.0425 19.9612 23.0187 19.9849 22.9711L20.8137 21.4001C20.9558 21.1382 21.311 21.1382 21.4531 21.4001L22.2819 22.9711C22.2819 22.9711 22.3293 23.0425 22.3767 23.0425L24.129 23.352C24.4132 23.3996 24.5316 23.7567 24.3185 23.9709H24.3659Z" fill="white"/>
      </svg>
    `,
    },
    {
      label: "Games",
      href: "/views/game/games.html",
      svg: `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_675_4273)">
      <path d="M20.1288 20.6334L20.0814 17.2707V7.08789H11.059C8.61982 7.08789 6.6543 9.05341 6.6543 11.4926V20.6334H20.1051H20.1288Z" fill="white"/>
      <path d="M13.8534 26.4121C12.1247 26.4121 10.7275 27.8093 10.7275 29.538C10.7275 31.2667 12.1247 32.6639 13.8534 32.6639C15.5821 32.6639 16.9793 31.2667 16.9793 29.538C16.9793 27.8093 15.5821 26.4121 13.8534 26.4121Z" fill="white"/>
      <path d="M22.3301 20.6334H35.9466V11.4926C35.9466 9.05341 33.9811 7.08789 31.542 7.08789H22.2827V17.247L22.3301 20.6334ZM26.0954 13.5291C25.5981 13.0318 25.5981 12.2503 26.0954 11.753C26.5927 11.2557 27.3741 11.2557 27.8714 11.753L28.866 12.7476L29.8606 11.753C30.3579 11.2557 31.1394 11.2557 31.6367 11.753C32.134 12.2503 32.134 13.0318 31.6367 13.5291L30.6421 14.5237L31.6367 15.5183C32.134 16.0156 32.134 16.7971 31.6367 17.2944C31.1394 17.7917 30.3579 17.7917 29.8606 17.2944L28.866 16.2998L27.8714 17.2944C27.3741 17.7917 26.5927 17.7917 26.0954 17.2944C25.5981 16.7971 25.5981 16.0156 26.0954 15.5183L27.09 14.5237L26.0954 13.5291Z" fill="white"/>
      <path d="M22.355 22.8125L22.5207 36.358H31.5432C33.9823 36.358 35.9479 34.3925 35.9479 31.9534V22.8125H22.355Z" fill="white"/>
      <path d="M20.1527 22.8125H6.67822V31.9534C6.67822 34.3925 8.64374 36.358 11.0829 36.358H20.3421L20.1764 22.8125H20.1527ZM13.8536 33.9189C11.4381 33.9189 9.47258 31.9534 9.47258 29.5379C9.47258 27.1224 11.4381 25.1569 13.8536 25.1569C16.269 25.1569 18.2345 27.1224 18.2345 29.5379C18.2345 31.9534 16.269 33.9189 13.8536 33.9189Z" fill="white"/>
      </g>
      <defs>
      <clipPath id="clip0_675_4273">
      <rect width="42.6257" height="42.6257" fill="white" transform="translate(0 0.410156)"/>
      </clipPath>
      </defs>
      </svg>
      `,
    },
    {
      label: "Events",
      href: "/views/event/event.html",
      svg: `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M33.5332 24.9943L18.8036 9.40258C18.0221 8.59324 16.6723 8.80748 16.2224 9.85486L4.59502 35.8014C4.00299 37.0868 5.28177 38.4436 6.6079 37.9199L32.9648 27.5413C34.0068 27.1367 34.3146 25.7798 33.5332 24.9705V24.9943ZM20.4849 27.1605L14.3279 27.827L16.4118 21.9712L22.5689 21.3046L20.4849 27.1605Z" fill="white"/>
      <path d="M37.157 9.42702L35.9492 10.7124C35.9492 10.7124 35.9019 10.7839 35.9019 10.8315L36.1387 12.5692C36.1861 12.8548 35.8782 13.0691 35.6177 12.95L34.0311 12.1883C34.0311 12.1883 33.9364 12.1883 33.9127 12.1883L32.3261 12.95C32.0656 13.0691 31.7577 12.8548 31.8051 12.5692L32.0419 10.8315C32.0419 10.8315 32.0419 10.7362 31.9945 10.7124L30.7868 9.42702C30.5737 9.21278 30.6921 8.85572 30.9762 8.80811L32.705 8.49866C32.705 8.49866 32.776 8.47485 32.7997 8.42725L33.6285 6.87998C33.7706 6.61813 34.1258 6.61813 34.2679 6.87998L35.0967 8.42725C35.0967 8.42725 35.1441 8.49866 35.1915 8.49866L36.9202 8.80811C37.2043 8.85572 37.3227 9.21278 37.1096 9.42702H37.157Z" fill="white"/>
      <path d="M37.772 19.9956L36.2801 20.924C36.2801 20.924 36.209 20.9954 36.209 21.0192L35.9959 22.7807C35.9722 23.0663 35.617 23.2091 35.4039 23.0187L34.0541 21.8761C34.0541 21.8761 33.983 21.8285 33.9356 21.8523L32.2069 22.1856C31.9228 22.2332 31.686 21.9475 31.8044 21.6857L32.4674 20.0432C32.4674 20.0432 32.4674 19.948 32.4674 19.9242L31.6149 18.3769C31.4728 18.1151 31.6623 17.8056 31.9701 17.8294L33.7225 17.9722C33.7225 17.9722 33.8172 17.9722 33.8409 17.9246L35.025 16.6392C35.2144 16.425 35.5696 16.5202 35.6407 16.8058L36.0433 18.5197C36.0433 18.5197 36.0906 18.5911 36.1143 18.615L37.7009 19.3529C37.9614 19.4719 37.9851 19.8528 37.7483 19.9956H37.772Z" fill="white"/>
      <path d="M28.3713 8.37917L27.1636 9.66459C27.1636 9.66459 27.1162 9.736 27.1162 9.78361L27.353 11.5213C27.4004 11.807 27.0926 12.0212 26.8321 11.9022L25.2454 11.1404C25.2454 11.1404 25.1507 11.1404 25.127 11.1404L23.5404 11.9022C23.2799 12.0212 22.9721 11.807 23.0194 11.5213L23.2562 9.78361C23.2562 9.78361 23.2562 9.6884 23.2089 9.66459L22.0011 8.37917C21.788 8.16493 21.9064 7.80787 22.1906 7.76026L23.9193 7.45081C23.9193 7.45081 23.9904 7.427 24.014 7.37939L24.8429 5.83213C24.985 5.57028 25.3402 5.57028 25.4823 5.83213L26.3111 7.37939C26.3111 7.37939 26.3584 7.45081 26.4058 7.45081L28.1345 7.76026C28.4187 7.80787 28.5371 8.16493 28.324 8.37917H28.3713Z" fill="white"/>
      </svg>
      `,
      children: [
        {
          label: "Events",
          href: "/views/event/event.html",
        },
        {
          label: "Create Event",
          href: "/views/event/create-event.html",
        },
      ],
    },
    //     {
    //       label: "My Tutorials",
    //       href: "/views/tutorial/tutorial.html",
    //       svg: `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M34.007 9.20801H8.62097C6.27656 9.20801 4.3584 11.1361 4.3584 13.4928V29.5367C4.3584 31.8933 6.27656 33.8215 8.62097 33.8215H34.007C36.3514 33.8215 38.2695 31.8933 38.2695 29.5367V13.4928C38.2695 11.1361 36.3514 9.20801 34.007 9.20801ZM16.8383 13.6832C16.8383 13.2785 17.2882 13.0167 17.6434 13.2071L25.5529 17.8013C25.9081 18.0155 25.9081 18.5154 25.5529 18.7297L17.6434 23.3239C17.2882 23.5381 16.8383 23.2763 16.8383 22.8478V13.6832ZM31.331 28.9892H13.8545C13.4756 29.5129 12.8835 29.8938 12.1968 29.8938C11.0364 29.8938 10.1129 28.9654 10.1129 27.799C10.1129 26.6326 11.0364 25.7043 12.1968 25.7043C12.9072 25.7043 13.4756 26.0851 13.8545 26.6088H31.331C31.9941 26.6088 32.5151 27.1325 32.5151 27.799C32.5151 28.4656 31.9941 28.9892 31.331 28.9892Z" fill="white"/>
    // </svg>
    // `
    //     },
    //     {
    //       label: "My Sheets",
    //       href: "#",
    //       svg: `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M21.3142 32.4702C19.775 29.7943 17.5253 28.3971 14.9677 27.9235C11.4156 27.2604 7.48453 28.3734 4.24023 29.8653V34.9567H16.3175L21.3379 38.1063L26.3583 34.9567H38.4356V29.8653C35.1913 28.3734 31.2602 27.2604 27.7081 27.9235C25.1505 28.3971 22.8772 29.7943 21.3616 32.4702H21.3142Z" stroke="white" stroke-width="0.768964" stroke-miterlimit="10"/>
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M2.17969 33.5127H14.8727C17.525 33.5127 19.8931 34.8388 21.3139 36.8754C22.7348 34.8388 25.0792 33.5127 27.7551 33.5127H40.4481V36.0702H27.7551C25.6238 36.0702 23.7767 37.349 22.9479 39.1724H19.7036C18.8748 37.349 17.0277 36.0702 14.8964 36.0702H2.17969V33.5127Z" fill="white"/>
    // <path fill-rule="evenodd" clip-rule="evenodd" d="M28.0618 5.30859H13.2848C11.8403 5.30859 10.6562 6.70577 10.6562 8.4108V19.5172C10.6562 21.2222 11.8403 22.6194 13.2848 22.6194H18.5183L20.3654 26.8583C20.5549 27.3082 21.218 27.3082 21.4074 26.8583L23.2545 22.6194H28.0854C29.53 22.6194 30.714 21.2222 30.714 19.5172V8.4108C30.714 6.70577 29.53 5.30859 28.0854 5.30859H28.0618ZM21.1943 19.6356C20.3891 20.4407 18.992 19.8724 18.992 18.712C18.992 18.0016 19.584 17.4096 20.2944 17.4096C21.4548 17.4096 22.0231 18.8067 21.218 19.6119L21.1943 19.6356ZM21.4785 14.8757C21.2416 14.9704 21.0996 15.1599 21.0996 15.4204C21.0996 15.8466 20.7443 16.2018 20.3181 16.2018C19.8918 16.2018 19.5366 15.8466 19.5366 15.4204C19.5366 14.5205 20.105 13.7153 20.9575 13.4075C22.3547 12.9339 22.7809 11.1341 21.7153 10.0685C20.8864 9.23963 19.5603 9.287 18.7788 10.1632C18.4947 10.471 18.021 10.5184 17.6895 10.2342C17.3816 9.95006 17.3343 9.47644 17.6185 9.14491C18.9683 7.60565 21.3364 7.53461 22.7809 8.97914C24.6517 10.8499 23.8939 13.9995 21.4311 14.852L21.4785 14.8757Z" fill="white"/>
    // </svg>
    // `
    //     },
    {
      label: "My Calendars",
      href: "/views/event/calendar.html",
      svg: `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.6931 10.4916C33.8169 9.75368 32.917 9.75368 31.8513 9.75368H30.1937V8.25402C30.1937 7.68272 30.2884 7.04001 29.8621 6.58773C29.2464 5.96882 28.1808 6.25447 27.9677 7.11142C27.8729 7.44468 27.9203 7.84935 27.9203 8.20641V9.75368H14.6826V8.27782C14.6826 7.32565 14.73 6.15925 13.3565 6.23066C12.3145 6.4449 12.3619 7.27805 12.3619 8.1588V9.77748H10.6569C8.09933 9.77748 6.74951 10.6106 6.74951 13.3243V33.8197C6.74951 36.1763 8.21773 37.176 10.4437 37.176H32.8933C35.4272 36.9618 35.9481 35.2717 35.9481 33.0341V14.205C35.9481 12.7292 36.0192 11.539 34.7404 10.4916H34.6931ZM27.423 23.8219L25.0786 26.2737C25.0786 26.2737 24.9839 26.4166 25.0075 26.5118L25.4575 29.8682C25.5285 30.4157 24.9602 30.8441 24.4629 30.6061L21.408 29.1302C21.408 29.1302 21.2423 29.0826 21.1712 29.1302L18.1164 30.6061C17.6191 30.8441 17.0507 30.4395 17.1218 29.8682L17.5717 26.5118C17.5717 26.5118 17.5717 26.3452 17.5007 26.2737L15.1563 23.8219C14.7774 23.4172 14.9905 22.7507 15.5352 22.6317L18.8505 22.0366C18.8505 22.0366 18.9926 21.9652 19.0399 21.8938L20.6266 18.8945C20.887 18.3946 21.5975 18.3946 21.858 18.8945L23.4683 21.8938C23.4683 21.8938 23.5867 22.0128 23.6577 22.0366L26.9731 22.6317C27.5177 22.7269 27.7309 23.4172 27.352 23.8219H27.423Z" fill="white"/>
      </svg>
      `,
    },
    {
      label: "Bookmarks",
      href: "/views/bookmarks/bookmark.html",
      svg: `<svg width="43" height="43" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_107_8905)">
      <path d="M15.4997 17.1298L25.0027 27.2451H25.1047L25.1045 4.6688C25.1045 2.2548 23.1495 0.299805 20.7355 0.299805H10.2635C7.84953 0.299805 5.89453 2.2548 5.89453 4.6688L5.89471 27.2451H5.99671L15.4997 17.1298Z" fill="white"/>
      </g>
      <defs>
      <clipPath id="clip0_107_8905">
      <rect width="30.6" height="30.6" fill="white" transform="translate(0.199219 0.299805)"/>
      </clipPath>
      </defs>
      </svg>
      `,
    },
    //     {
    //       label: "Notifications",
    //       href: "#",
    //       svg: `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M34.5988 28.2797C34.4567 27.9227 34.1962 27.637 33.9594 27.3276L33.1779 26.2326C31.615 24.1378 31.8992 24.3044 31.8992 21.6622V18.0678C31.8992 17.425 31.9228 16.7823 31.8992 16.1396C31.615 10.6171 26.4525 6.18949 21.0059 6.35612C16.246 6.61796 12.0782 9.92674 11.0125 14.64C10.7284 15.8778 10.752 17.1156 10.752 18.3772V21.567C10.752 24.2806 11.0362 23.876 9.52063 26.0421L8.50235 27.518C7.93401 28.3273 7.43671 29.2557 8.43131 30.1364C9.02333 30.6363 9.85217 30.4935 10.5863 30.4935H21.7163H32.207C32.6096 30.4935 33.0358 30.5411 33.4384 30.4935C34.2199 30.3745 34.7409 29.6604 34.7409 28.9224C34.7409 28.7082 34.6935 28.494 34.5988 28.2797Z" fill="white"/>
    // <path d="M24.2974 35.2779C25.0078 34.5161 25.3157 33.7306 25.5051 32.707H17.2642C17.6667 36.2538 21.7162 37.7297 24.2974 35.2779Z" fill="white"/>
    // </svg>
    // `
    //     },
    {
      label: "Settings",
      href: "/views/user/preferences.html",
      svg: `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M33.841 17.8838C33.6042 17.0744 33.2726 16.2889 32.8937 15.5748L34.8829 13.5752C35.1434 13.3134 35.1908 12.8849 35.0013 12.5754C33.7936 10.7663 32.2544 9.21906 30.4546 8.00505C30.1467 7.79082 29.7205 7.83842 29.46 8.12407L27.4708 10.1236C26.7367 9.74275 25.9789 9.4095 25.1737 9.17146V6.36257C25.1737 5.9817 24.9133 5.64844 24.558 5.57703C23.5161 5.36279 22.4504 5.26758 21.3374 5.26758C20.2244 5.26758 19.1588 5.3866 18.1168 5.57703C17.7616 5.64844 17.5011 5.9817 17.5011 6.36257V9.17146C16.696 9.4095 15.9145 9.74275 15.2041 10.1236L13.2149 8.12407C12.9544 7.86223 12.5281 7.81462 12.2203 8.00505C10.4205 9.21906 8.88124 10.7663 7.67351 12.5754C7.46038 12.8849 7.50774 13.3134 7.79191 13.5752L9.78111 15.5748C9.40222 16.3127 9.07068 17.0744 8.83387 17.8838H6.03952C5.66062 17.8838 5.32909 18.1456 5.25805 18.5027C5.04492 19.5501 4.9502 20.6212 4.9502 21.74C4.9502 22.8588 5.0686 23.93 5.25805 24.9774C5.32909 25.3345 5.66062 25.5963 6.03952 25.5963H8.83387C9.07068 26.4056 9.40222 27.1912 9.78111 27.9053L7.79191 29.9049C7.53142 30.1667 7.48406 30.5952 7.67351 30.9046C8.88124 32.7137 10.4205 34.261 12.2203 35.475C12.5281 35.6893 12.9544 35.6417 13.2149 35.356L15.2041 33.3565C15.9382 33.7373 16.696 34.0706 17.5011 34.3086V37.1175C17.5011 37.4984 17.7616 37.8316 18.1168 37.903C19.1588 38.1173 20.2244 38.2125 21.3374 38.2125C22.4504 38.2125 23.5161 38.0935 24.558 37.903C24.9133 37.8316 25.1737 37.4984 25.1737 37.1175V34.3086C25.9789 34.0706 26.7604 33.7373 27.4708 33.3565L29.46 35.356C29.7205 35.6178 30.1467 35.6655 30.4546 35.475C32.2544 34.261 33.7936 32.7137 35.0013 30.9046C35.2145 30.5952 35.1671 30.1667 34.8829 29.9049L32.8937 27.9053C33.2726 27.1674 33.6042 26.4056 33.841 25.5963H36.6353C37.0142 25.5963 37.3458 25.3345 37.4168 24.9774C37.6299 23.93 37.7247 22.8588 37.7247 21.74C37.7247 20.6212 37.6063 19.5501 37.4168 18.5027C37.3458 18.1456 37.0142 17.8838 36.6353 17.8838H33.841ZM22.5452 28.0005C18.0695 28.8575 14.2331 25.0012 15.0857 20.5022C15.5593 18.0028 17.5958 15.9556 20.0587 15.5034C24.5344 14.6464 28.3707 18.5027 27.5182 23.0017C27.0445 25.5011 25.008 27.5482 22.5452 28.0005Z" fill="white"/>
      </svg>
      `,
    },
    {
      label: "Profile",
      href: "/views/user/profile.html",
      svg: `<svg width="43" height="44" viewBox="0 0 43 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.3123 5.5127C12.2188 5.5127 4.854 12.9158 4.854 22.0566C4.854 31.1974 12.2188 38.6004 21.3123 38.6004C30.4058 38.6004 37.7706 31.1974 37.7706 22.0566C37.7706 12.9158 30.4058 5.5127 21.3123 5.5127ZM21.3123 10.0355C24.6276 10.0355 27.3036 12.7253 27.3036 16.0579C27.3036 19.3905 24.6276 22.0804 21.3123 22.0804C17.9969 22.0804 15.321 19.3905 15.321 16.0579C15.321 12.7253 17.9969 10.0355 21.3123 10.0355ZM28.9612 32.6732H13.6633C12.1004 32.6732 11.1058 31.0069 11.8162 29.6025C13.3318 26.5794 17.026 24.437 21.3123 24.437C25.5985 24.437 29.2928 26.5794 30.8083 29.6025C31.5188 31.0069 30.5242 32.6732 28.9612 32.6732Z" fill="white"/>
      </svg>
      `,
    },
  ];

  async function fetchComponent(componentName) {
    try {
      const response = await fetch(componentPaths[componentName]);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }
      return await response.text();
    } catch (error) {
      console.error(error);
      return `<div class="p-4 bg-red-100 ">Error loading ${componentName} component</div>`;
    }
  }

  async function injectComponents() {
    const placeholders = document.querySelectorAll("[data-component]");

    for (const placeholder of placeholders) {
      const componentName = placeholder.getAttribute("data-component");
      if (componentPaths[componentName]) {
        const html = await fetchComponent(componentName);
        placeholder.innerHTML = html;
      }
    }

    setupSidebar();
    setupHero();
    renderDrawerMenu();

    window.dispatchEvent(new Event("components-injected"));
  }

  function setupHero() {
    const heroContainer = document.querySelector('[data-component="hero"]');
    if (!heroContainer) return;

    const hideHero = document.body.hasAttribute("data-no-hero");
    if (hideHero) {
      heroContainer.style.display = "none";
    }
  }

  function setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const desktopSidebarBtn = document.getElementById("desktop-sidebar-btn");

    // Left drawer elements
    const leftDrawer = document.getElementById("left-drawer");
    const leftDrawerOverlay = document.getElementById("left-drawer-overlay");
    const leftDrawerClose = document.getElementById("left-drawer-close");

    if (!sidebar || !sidebarToggle || !sidebarOverlay) return;

    // Mobile sidebar toggle
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
      sidebarOverlay.classList.remove("hidden");
      requestAnimationFrame(() => {
        sidebarOverlay.classList.add("opacity-0");
      });
    });

    // Desktop sidebar button click: open left drawer
    if (desktopSidebarBtn && leftDrawer && leftDrawerOverlay) {
      desktopSidebarBtn.addEventListener("click", () => {
        leftDrawer.classList.remove("-translate-x-full");
        leftDrawerOverlay.classList.remove("hidden");
      });
    }

    // Close left drawer
    if (leftDrawerClose) {
      leftDrawerClose.addEventListener("click", () => {
        leftDrawer.classList.add("-translate-x-full");
        leftDrawerOverlay.classList.add("hidden");
      });
    }

    leftDrawerOverlay?.addEventListener("click", () => {
      leftDrawer.classList.add("-translate-x-full");
      leftDrawerOverlay.classList.add("hidden");
    });

    // Close mobile sidebar
    function closeSidebar() {
      sidebar.classList.add("-translate-x-full");
      sidebarOverlay.classList.add("hidden");
      sidebarOverlay.classList.remove("opacity-0");
    }

    sidebarOverlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSidebar();
        leftDrawer?.classList.add("-translate-x-full");
        leftDrawerOverlay?.classList.add("hidden");
      }
    });
  }

  function renderDrawerMenu() {
    const menuContainer = document.getElementById("drawer-menu");
    if (!menuContainer) return;

    drawerMenuItems.forEach((item) => {
      const wrapper = document.createElement("div");

      // Dropdown items
      if (item.children && item.children.length > 0) {
        const link = document.createElement("div");
        link.className =
          "flex items-center justify-between text-gray-200 hover:bg-gradient-to-bl hover:rounded-xl hover:px-3 hover:shadow-sm shadow-gray-600 py-1 from-[#F59275] to-[#F1647A] transition-colors cursor-pointer";

        const content = document.createElement("div");
        content.className = "flex items-center gap-3";
        content.innerHTML = `
        ${item.svg}
        <span class="text-md font-medium">${item.label}</span>
      `;
        link.appendChild(content);

        const dropdownIcon = document.createElement("span");
        dropdownIcon.innerHTML = "▼";
        dropdownIcon.className = "text-sm transition-transform";
        link.appendChild(dropdownIcon);

        wrapper.appendChild(link);

        // Dropdown content
        const dropdown = document.createElement("div");
        dropdown.className =
          "ml-8 mt-1 flex flex-col gap-1 hidden transition-all";

        item.children.forEach((child) => {
          const childLink = document.createElement("a");
          childLink.href = child.href;
          childLink.className =
            "text-base text-gray-200 hover:text-white px-2 py-1 rounded-md hover:bg-gray-200/10 transition py-2";
          childLink.textContent = child.label;
          dropdown.appendChild(childLink);
        });

        wrapper.appendChild(dropdown);

        // Toggle dropdown
        link.addEventListener("click", () => {
          const isHidden = dropdown.classList.contains("hidden");
          dropdown.classList.toggle("hidden");
          dropdownIcon.style.transform = isHidden
            ? "rotate(180deg)"
            : "rotate(0deg)";
        });
      } else {
        // Non-dropdown item (a normal <a>)
        const link = document.createElement("a");
        link.href = item.href;
        link.className =
          "flex items-center gap-3 text-gray-200 hover:bg-gradient-to-bl hover:rounded-xl hover:px-3 hover:shadow-sm shadow-gray-600 py-1 from-[#F59275] to-[#F1647A] transition-colors cursor-pointern";
        link.innerHTML = `${item.svg}<span class="text-md font-medium">${item.label}</span>`;
        wrapper.appendChild(link);

        // Divider if needed
        if (item.label === "Games" || item.label === "Bookmarks") {
          const divider = document.createElement("div");
          divider.className = "w-full border-t border-gray-500 my-2";
          wrapper.appendChild(divider);
        }
      }

      menuContainer.appendChild(wrapper);
    });
  }

  injectComponents();
});
