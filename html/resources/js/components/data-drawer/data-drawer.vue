<template>
    <v-navigation-drawer
        class="data-sidebar"
        v-model="displayDrawer"
        :width="360"
        fixed
        right
    >
        <event-chart />
        <v-select
            v-if="eventTypes.length"
            v-model="select"
            :items="eventTypes"
            item-text="type"
            item-value="type"
            label="Select event type"
            single-line
        ></v-select>
        <event-progress-chart v-if="select" />
    </v-navigation-drawer>
</template>
<script src="./data-drawer.js"></script>
