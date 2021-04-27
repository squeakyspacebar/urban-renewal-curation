<template>
    <v-app class="app">
        <main class="site-main">
            <search-bar @toggle-drawer="toggleDrawerHandler" />
            <data-drawer v-if="mapLoaded" />
            <parcel-map />
        </main>
        <footer class="site-footer">
            <span
                >Copyright &copy;. All rights reserved. Design from
                <a
                    href="http://dcicblog.umd.edu/human-face-of-big-data/"
                    class="bft"
                    >Human-Face Team</a
                ></span
            >
        </footer>
    </v-app>
</template>
<script src="./app.js"></script>
