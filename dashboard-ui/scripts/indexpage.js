define(["loading","inputManager","libraryMenu","playbackManager","mainTabsManager","homeSections","globalize","apphost","serverNotifications","events","emby-button"],function(loading,inputManager,libraryMenu,playbackManager,mainTabsManager,homeSections,globalize,appHost,serverNotifications,events){"use strict";function displayPreferencesKey(){return AppInfo.isNativeApp?"Emby Mobile":"webclient"}function dismissWelcome(page,userId){var apiClient=ApiClient;getDisplayPreferences(apiClient,"home",userId).then(function(result){result.CustomPrefs[homePageTourKey]=homePageDismissValue,apiClient.updateDisplayPreferences("home",result,userId,displayPreferencesKey())})}function showWelcomeIfNeeded(page,displayPreferences){if(displayPreferences.CustomPrefs[homePageTourKey]==homePageDismissValue)page.querySelector(".welcomeMessage").classList.add("hide");else{loading.hide();var elem=page.querySelector(".welcomeMessage");elem.classList.remove("hide"),displayPreferences.CustomPrefs[homePageTourKey]?(elem.querySelector(".tourHeader").innerHTML=globalize.translate("HeaderWelcomeBack"),elem.querySelector(".tourButtonText").innerHTML=globalize.translate("ButtonTakeTheTourToSeeWhatsNew")):(elem.querySelector(".tourHeader").innerHTML=globalize.translate("HeaderWelcomeToProjectWebClient"),elem.querySelector(".tourButtonText").innerHTML=globalize.translate("ButtonTakeTheTour"))}}function takeTour(page,userId){require(["slideshow"],function(){var slides=[{imageUrl:"css/images/tour/web/tourcontent.jpg",title:globalize.translate("WebClientTourContent")},{imageUrl:"css/images/tour/web/tourmovies.jpg",title:globalize.translate("WebClientTourMovies")},{imageUrl:"css/images/tour/web/tourmouseover.jpg",title:globalize.translate("WebClientTourMouseOver")},{imageUrl:"css/images/tour/web/tourtaphold.jpg",title:globalize.translate("WebClientTourTapHold")},{imageUrl:"css/images/tour/web/tourmysync.png",title:globalize.translate("WebClientTourMySync")},{imageUrl:"css/images/tour/web/toureditor.png",title:globalize.translate("WebClientTourMetadataManager")},{imageUrl:"css/images/tour/web/tourplaylist.png",title:globalize.translate("WebClientTourPlaylists")},{imageUrl:"css/images/tour/web/tourcollections.jpg",title:globalize.translate("WebClientTourCollections")},{imageUrl:"css/images/tour/web/tourusersettings1.png",title:globalize.translate("WebClientTourUserPreferences1")},{imageUrl:"css/images/tour/web/tourusersettings2.png",title:globalize.translate("WebClientTourUserPreferences2")},{imageUrl:"css/images/tour/web/tourusersettings3.png",title:globalize.translate("WebClientTourUserPreferences3")},{imageUrl:"css/images/tour/web/tourusersettings4.png",title:globalize.translate("WebClientTourUserPreferences4")},{imageUrl:"css/images/tour/web/tourmobile1.jpg",title:globalize.translate("WebClientTourMobile1")},{imageUrl:"css/images/tour/web/tourmobile2.png",title:globalize.translate("WebClientTourMobile2")},{imageUrl:"css/images/tour/enjoy.jpg",title:globalize.translate("MessageEnjoyYourStay")}];require(["slideshow"],function(slideshow){var newSlideShow=new slideshow({slides:slides,interactive:!0,loop:!1});newSlideShow.show(),dismissWelcome(page,userId),page.querySelector(".welcomeMessage").classList.add("hide")})})}function getRequirePromise(deps){return new Promise(function(resolve,reject){require(deps,resolve)})}function loadHomeTab(page,tabContent){var apiClient=ApiClient;if(apiClient){var userId=Dashboard.getCurrentUserId();loading.show();var promises=[Dashboard.getCurrentUser(),getRequirePromise(["userSettings"])];Promise.all(promises).then(function(responses){var user=responses[0],userSettings=responses[1];homeSections.loadSections(tabContent.querySelector(".sections"),apiClient,user,userSettings).then(function(){loading.hide()})}),AppInfo.isNativeApp||getDisplayPreferences(apiClient,"home",userId).then(function(displayPreferences){showWelcomeIfNeeded(page,displayPreferences)})}}function getDisplayPreferences(apiClient,key,userId){return apiClient.getDisplayPreferences(key,userId,displayPreferencesKey())}function getTabs(){return[{name:globalize.translate("TabHome")},{name:globalize.translate("TabFavorites")},{name:globalize.translate("ButtonSearch"),cssClass:"searchTabButton"}]}var homePageDismissValue="14",homePageTourKey="homePageTour";return function(view,params){function onBeforeTabChange(e){preLoadTab(view,parseInt(e.detail.selectedTabIndex))}function onTabChange(e){loadTab(view,parseInt(e.detail.selectedTabIndex))}function getTabContainers(){return view.querySelectorAll(".pageTabContent")}function initTabs(){mainTabsManager.setTabs(view,currentTabIndex,getTabs,getTabContainers,onBeforeTabChange,onTabChange)}function getTabController(page,index,callback){var depends=[];switch(index){case 0:break;case 1:depends.push("scripts/homefavorites");break;case 2:depends.push("scripts/searchtab");break;default:return}require(depends,function(controllerFactory){var tabContent;0==index&&(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),self.tabContent=tabContent);var controller=tabControllers[index];controller||(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),controller=0===index?self:2===index?new controllerFactory(view,tabContent,{}):new controllerFactory(view,params,tabContent),tabControllers[index]=controller,controller.initTab&&controller.initTab()),callback(controller)})}function preLoadTab(page,index){getTabController(page,index,function(controller){renderedTabs.indexOf(index)==-1&&controller.preRender&&controller.preRender()})}function onInputCommand(e){switch(e.detail.command){case"search":e.preventDefault(),Dashboard.navigate("search.html")}}function loadTab(page,index){currentTabIndex=index,getTabController(page,index,function(controller){initialTabIndex=null,renderedTabs.indexOf(index)==-1&&(renderedTabs.push(index),controller.renderTab())})}function onPlaybackStop(e,state){state.NowPlayingItem&&"Video"==state.NowPlayingItem.MediaType&&(renderedTabs=[],mainTabsManager.getTabsElement().triggerBeforeTabChange(),mainTabsManager.getTabsElement().triggerTabChange())}function onUserDataChanged(e,apiClient,userData){userData.UserId==Dashboard.getCurrentUserId()&&(renderedTabs=[])}var isViewRestored,self=this,currentTabIndex=parseInt(params.tab||"0"),initialTabIndex=currentTabIndex;self.renderTab=function(){var tabContent=view.querySelector(".pageTabContent[data-index='0']");loadHomeTab(view,tabContent)};var tabControllers=[],renderedTabs=[];view.querySelector(".btnTakeTour").addEventListener("click",function(){takeTour(view,Dashboard.getCurrentUserId())}),view.querySelector(".sections").addEventListener("settingschange",function(){renderedTabs=[],mainTabsManager.getTabsElement().triggerBeforeTabChange(),mainTabsManager.getTabsElement().triggerTabChange()}),view.addEventListener("viewbeforeshow",function(e){isViewRestored=e.detail.isRestored,initTabs(),libraryMenu.setDefaultTitle()}),view.addEventListener("viewshow",function(e){isViewRestored=e.detail.isRestored,document.querySelector(".skinHeader").classList.add("noHomeButtonHeader"),isViewRestored||mainTabsManager.selectedTabIndex(initialTabIndex),events.on(playbackManager,"playbackstop",onPlaybackStop),events.on(serverNotifications,"UserDataChanged",onUserDataChanged),inputManager.on(window,onInputCommand)}),view.addEventListener("viewbeforehide",function(e){inputManager.off(window,onInputCommand),events.off(playbackManager,"playbackstop",onPlaybackStop),events.off(serverNotifications,"UserDataChanged",onUserDataChanged)}),view.addEventListener("viewhide",function(e){document.querySelector(".skinHeader").classList.remove("noHomeButtonHeader")}),view.addEventListener("viewdestroy",function(e){tabControllers.forEach(function(t){t.destroy&&t.destroy()})})}});