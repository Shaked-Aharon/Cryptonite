/// <reference path="jquery-3.4.1.js" />
/// <reference path="jquery-ui.js" />
(() => {
    $(() => {
        //Declare Global Variable
        let tempInput, coinsNames, myInter, orderByChg24H = true;
        let availableCoins = [], coinsArrOfObj = [];
        const loadingDiv = `<div id="loadingDiv" class="mx-auto"><p class="text-center">Loading</p></div>`;
        //-------------------------------------------------------------------------------

        //Call to functions once at first loading to load the coins and add them
        getCoins();
        //----------------------------------------------------------------------

        //Create the Chart Object and puts some Properties
        const chart = {
            title: {
                text: ""
            },
            axisX: {
                ValueFormatString: "HH MM"
            },
            axisY: {
                title: "Coin Value",
                titleFontColor: "#999",
                lineColor: "#fff",
                labelFontColor: "#999",
                ValueFormatString: "#,##0 Units",
                includeZero: false
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: []
        };
        //------------------------------------------------------------------------------
        //Loading apprent Function
        function loading(parent) {
            $(parent).append(loadingDiv);
        }
        //-------------------------------------------------------------------------------

        // This function get all the coins from the api create an object for each of them
        function getCoins() {
            loading("#coins > #coinsContainer");
            $.getJSON(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD`, json => {
                for (let item of json) {
                    availableCoins.push(item.symbol);
                    const coin = new Coin(item.id, item.symbol, item.name, item.market_cap_rank, item.price_change_percentage_24h);
                    coinsArrOfObj.push(coin);
                }
                $("#serachBtn").attr("data-list", availableCoins.toString());
                displayCoins();
            }).fail(() => {
                $("#coins > #coinsContainer").empty();
                $("#coins > #coinsContainer").append("<h2 class='mx-auto col-12'>Error.</h2><br><p>There is a problem to get data from the server<br>Please try again later.</p>");
            });
        }
        //-----------------------------------------------------------------------------

        //Display all the coins on the screen
        function displayCoins() {
            $("#coins > #coinsContainer").empty();
            for (let coin of coinsArrOfObj) {
                coin.display();
            }
        }
        //--------------------------------------------------------

        //Hide and Show content by click
        $("#reportsBtn").click(async function () {
            if ($("#reports").css("display") === "block") { return; }
            if ($(`.card > label > input[type="checkbox"]:checked`).length == 0) {
                $("#alertModal .modal-body").empty();
                $("#alertModal .modal-body").append("<p>In order to go to the Reports Page, You must select at least one coin.</p>");
                $("#alertModal").modal("show");
                // alert("Choose at least 1 coin");
                return;
            }
            await showCoinsValue();
            chart.title.text = `${coinsNames} to USD`;
            $("#about, #coins, .form-inline.searchArea").css("display", "none");
            $("#reports").css("display", "block");
            $("#aboutBtn, #coinsBtn").css("border", "none");
            $("#reportsBtn").css("border-bottom", "1px solid black");
        });

        $("#aboutBtn").click(() => {
            if ($("#about").css("display") == "block") { return; }
            clearInterval(myInter);
            $("#reports, #coins, .form-inline.searchArea").css("display", "none");
            $("#about").css("display", "block");
            $("#reportsBtn, #coinsBtn").css("border", "none");
            $("#aboutBtn").css("border-bottom", "1px solid black");
        });

        $("#coinsBtn").click(() => {
            if ($("#coins").css("display") == "block") { return; }
            clearInterval(myInter);
            $("#about, #reports").css("display", "none");
            $("#coins, .form-inline.searchArea").css("display", "block");
            $("#reportsBtn, #aboutBtn").css("border", "none");
            $("#coinsBtn").css("border-bottom", "1px solid black");
        });
        //---------------------------------------------

        //Check if there is more then 5 checked checkboxs
        $(document).on("change", `input[type="checkbox"]`, function () {
            if ($('#myModal').is(':visible') || $("input:checkbox:checked").length < 6) {
                return;
            }
            tempInput = this;
            const checkboxArr = [];
            $(tempInput).prop('checked', false);
            $(`input[type="checkbox"]:checked`).each(function () {
                checkboxArr.push(this);
            });
            changeModalContent(checkboxArr);
            $('#myModal').modal('show');
        });
        //-----------------------------------------------

        //Clear Modal's content
        $(".modal").on("hidden.bs.modal", function () {
            $(".modal-body").html("");
        });
        //-----------------------------------------------

        // Get an array and put it in the modal body
        function changeModalContent(checkboxArr) {
            let content = `<p class="text-center">There is a limit of 5 Coins at once <br> please choose wich coin would you like to turn off</p><br>`;
            for (let checkbox of checkboxArr) {
                const checkBoxToggle = `<label class="switch"><input type="checkbox" id="${checkbox.id}" checked><span class="slider round"></span></label>`;
                const h3 = `<h3 class="text-uppercase col-3">${(checkbox.id)}</h3>`;
                const div = `<div class="row">${h3}${checkBoxToggle}</div>`;
                content += (checkboxArr.indexOf(checkbox) == checkboxArr.length - 1) ? div : div + "<hr>";
            }
            $("div.modal-body").append(content);
        }
        //----------------------------------------------

        //Check for changes in modal checkbox's and manipulate card's checkbox in addition
        $(document).on("click", `.modal-footer > button.btn-primary`, function () {
            let changedVal = false;
            $(`.modal-body > div > label > input[type="checkbox"]`).each(function () {
                if (!this.checked) {
                    changedVal = true;
                    $(`.card > label > input#${this.id}`).prop('checked', false);
                }
            });
            if (changedVal) {
                $(tempInput).prop('checked', true);
            }
            $('#myModal').modal('hide');
        });
        //--------------------------------------------------

        //Get Coin info from api
        function getCoinInfo(coinId, callback, errorCallBack) {
            let temp;
            $.getJSON(`https://api.coingecko.com/api/v3/coins/${coinId}`, (json, status) => {
                $(this).next().next().next().children().append(loading);
                if (status === "success") {
                    callback(json);
                } else {
                    alert("a");
                    errorCallBack("<h2 class='mx-auto col-12'>Error.</h2><br><p>There is a problem to get data from the server<br>Please try again later.</p>");
                }
            });
        }
        //---------------------------------------------------

        //Check for click on More Info Btn and get relevant information
        $(document).on("click", `.card-body > .moreInfo`, function () {
            const moreInfo = $(this).next().next().next().children();
            // if ($(this).next().next().next().hasClass("show")) { alert("aa") }
            if (localStorage.getItem(this.id) !== null) {
                moreInfo.empty();
                moreInfo.append(localStorage.getItem(this.id));
            } else {
                moreInfo.empty();
                loading(moreInfo);
                getCoinInfo(this.id, json => {
                    const img = `<img src="${json.image.small}" height="50" width="50">`;
                    const p = `<p><b><u>Value:</u></b><br><b>USD:</b>${json.market_data.current_price.usd}<b>&#36;</b><br><b>EUR:</b>${json.market_data.current_price.usd}<b>&#8364;</b><br><b>NIS:</b>${json.market_data.current_price.ils}<b>&#8362;</b></p>`;
                    localStorage.setItem(this.id, img + p);
                    setTimeout(() => { localStorage.removeItem(this.id) }, 120000);
                    moreInfo.empty();
                    moreInfo.append(img, p);
                }, Err => {
                    moreInfo.empty();
                    moreInfo.append(Err);
                });
            }
        });
        //--------------------------------------------------------------

        //Get Coins Value from API
        function getCoinsValue(coinsNames, callback) {
            $.getJSON(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsNames}&tsyms=USD`, (data, status, xhr) => {
                (xhr.responseJSON.Response !== "Error") ? callback(data) : alert(xhr.responseJSON.Message);
            })
        }
        //------------------------------------------------------------------

        //Get all selected coins and puts them in a String with all The Names
        function getSelectedCoins() {
            const checkboxArr = $(`input[type="checkbox"]:checked`);
            coinsNames = "";
            let counter = 1;
            for (let checkbox of checkboxArr) {
                coinsNames += counter < checkboxArr.length ? (checkbox.id).toUpperCase() + "," : (checkbox.id).toUpperCase();
                counter++;
            }
        }
        //------------------------------------------------------------------------

        //Show the Selected Coins in the Chart
        function showCoinsValue() {
            chart.data = [];
            getSelectedCoins();//Call this function in order the update coinsNames
            getCoinsValue(coinsNames, coins => {
                const coinsArr = coinsNames.split(",");
                for (let coin of coinsArr) {
                    var local = new Date();
                    var localdatetime = local.getHours() + ":" + local.getMinutes() + ":" + local.getSeconds();
                    chart.data.push({
                        showInLegend: true,
                        name: coin,
                        type: "spline",
                        dataPoints: [{ label: localdatetime, y: coins[coin].USD }]
                    });
                    $("#chartContainer").CanvasJSChart(chart);
                }
                myInter = setInterval(liveChartUpdate, 2000);
            });
            $("#chartContainer").CanvasJSChart(chart);
        }
        //--------------------------------------------------------------------------

        //Get all the coins that in the chart and update the chart with new information
        function liveChartUpdate() {
            var local = new Date();
            var localdatetime = local.getHours() + ":" + local.getMinutes() + ":" + local.getSeconds();
            getCoinsValue(coinsNames, coins => {
                const coinsArr = coinsNames.split(",");
                let counter = 0;
                for (let coin of coinsArr) {
                    chart.data[counter].dataPoints.push({ label: localdatetime, y: coins[coin].USD });
                    counter++;
                }
            });
            $("#chartContainer").CanvasJSChart(chart);
        }
        //--------------------------------------------------------------------------------------

        //Search Button Clicked check for available coins and show result
        $("#searchBtn").click(() => {
            if ($("#searchInput").val() == "") { $("#coins > .row > .card").css("display", "block"); return; }
            if (!availableCoins.includes($("#searchInput").val().toLowerCase())) {
                $("#alertModal .modal-body").empty();
                $("#alertModal .modal-body").append("<p>There is No such coin.</p>");
                $("#alertModal").modal("show");
                return;
            }
            $("#coins > .row > .card").css("display", "none");
            const allCardH5 = $("#coins > .row > .card > div > h5");
            for (let h5 of allCardH5) {
                if ($(h5).text().toLowerCase() == $("#searchInput").val().toLowerCase()) {
                    $(h5).parent().parent().css("display", "block");
                }
            }
        });
        //---------------------------------------------------------------------

        //See if Enter has been clicked to toggle the search button
        $("#searchInput").keyup(function (event) {
            if (event.keyCode === 13) {
                $("#searchBtn").click();
                return false;
            }
        });
        //------------------------------------------------------------

        $("#orderByName").click(function () {
            orderByChg24H = true;
            $("#orderByValue").children().html("");
            $("#orderByName").addClass("btn btn-secondary");
            $("#orderByRank , #orderByValue").removeClass("btn btn-secondary");
            coinsArrOfObj.sort(function (a, b) {
                var nameA = a.symbol.toUpperCase();
                var nameB = b.symbol.toUpperCase();
                if (nameA < nameB) { return -1; }
                if (nameA > nameB) { return 1; } 2
                return 0;
            });
            displayCoins();
        });

        $("#orderByRank").click(function () {
            orderByChg24H = true;
            $("#orderByRank").addClass("btn btn-secondary");
            $("#orderByValue, #orderByName").removeClass("btn btn-secondary");
            $("#orderByValue").children().html("");
            coinsArrOfObj.sort((a, b) => a.rank - b.rank);
            displayCoins();
        });

        $("#orderByValue").click(function () {
            $("#orderByValue").addClass("btn btn-secondary");
            $("#orderByRank, #orderByName").removeClass("btn btn-secondary");
            if (orderByChg24H) {
                coinsArrOfObj.sort((a, b) => b.valueChange - a.valueChange);
                $("#orderByValue").children().html("&uarr;");
                $("#orderByValue").children().css("color", "lightgreen");
                orderByChg24H = false;
            } else {
                coinsArrOfObj.sort((a, b) => a.valueChange - b.valueChange);
                $("#orderByValue").children().html("&darr;");
                $("#orderByValue").children().css("color", "salmon");
                orderByChg24H = true;
            }

            displayCoins();
        });

        $("#searchInput").on("keyup", function () {
            if ($("#searchInput").val() === "") { $(".card").css("display", "block") }
        });

        $("#alertModal button").click(() => {
            $("#coinsBtn").click();
        })

        $("#clearBtn").click(() => {
            $("input[type='checkbox']").prop("checked", false);
        });

        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    });
})();