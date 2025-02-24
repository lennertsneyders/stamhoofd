import { ArrayDecoder, AutoEncoderPatchType, Decoder, ObjectData } from "@simonbackx/simple-encoding";
import { SimpleError } from "@simonbackx/simple-errors";
import { Request } from "@simonbackx/simple-networking";
import { EventBus, Toast } from "@stamhoofd/components";
import { SessionManager } from "@stamhoofd/networking";
import { PaginatedResponse, PaginatedResponseDecoder, PrivateOrder, PrivateWebshop, TicketPrivate, Version, WebshopOrdersQuery, WebshopPreview, WebshopTicketsQuery } from "@stamhoofd/structures";

import { OrganizationManager } from "../../../classes/OrganizationManager";

/**
 * Responsible for managing a single webshop orders and tickets
 * + persistent storage and loading orders from local database instead of the server
 */
export class WebshopManager {
    preview: WebshopPreview
    webshop: PrivateWebshop | null = null
    lastFetchedWebshop: Date | null = null

    private webshopPromise: Promise<PrivateWebshop> | null = null
    private webshopFetchPromise: Promise<PrivateWebshop> | null = null

    database: IDBDatabase | null = null
    private databasePromise: Promise<IDBDatabase> | null = null


    lastFetchedOrder: { updatedAt: Date, number: number } | null | undefined = undefined
    lastFetchedTicket: { updatedAt: Date, id: string } | null | undefined = undefined
    isLoadingOrders = false
    isLoadingTickets = false
    savingTicketPatches = false

    lastUpdatedOrders: Date | null = null
    lastUpdatedTickets: Date | null = null

    /**
     * Listen for new orders that are being fetched or loaded
     */
    ordersEventBus = new EventBus<string, PrivateOrder[]>()

    constructor(preview: WebshopPreview) {
        this.preview = preview
    }

    /**
     * Cancel all pending loading states and retries
     */
    close() {
        Request.cancelAll(this)
    }

    /**
     * Fetch a webshop every time
     */
    async fetchWebshop(shouldRetry = true) {
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "GET",
            path: "/webshop/"+this.preview.id,
            decoder: PrivateWebshop as Decoder<PrivateWebshop>,
            shouldRetry
        })

        // Clone data and keep references
        OrganizationManager.organization.webshops.find(w => w.id == this.preview.id)?.set(response.data)
        this.preview.set(response.data)

        // Save async (could fail in some unsupported browsers)
        this.storeWebshop(response.data).catch(console.error)

        return response.data
    }

    async patchWebshop(webshopPatch: AutoEncoderPatchType<PrivateWebshop>) {
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "PATCH",
            path: "/webshop/"+this.preview.id,
            body: webshopPatch,
            decoder: PrivateWebshop as Decoder<PrivateWebshop>
        })

        if (this.webshop) {
            this.webshop.set(response.data)
        } else {
            this.webshop = response.data
        }

        // Clone data and keep references
        OrganizationManager.organization.webshops.find(w => w.id == this.preview.id)?.set(response.data)
        this.preview.set(response.data)
        OrganizationManager.save().catch(console.error)

        // Save async (could fail in some unsupported browsers)
        this.storeWebshop(response.data).catch(console.error)
    }

    async loadWebshopFromDatabase(): Promise<PrivateWebshop | undefined> {
        const raw = await this.readSettingKey("webshop")
        if (raw === undefined) {
            return undefined
        }
        const webshop = PrivateWebshop.decode(new ObjectData(raw, { version: Version }))

        // Clone data and keep references
        OrganizationManager.organization.webshops.find(w => w.id == this.preview.id)?.set(webshop)
        this.preview.set(webshop)

        return webshop
    }

    async storeWebshop(webshop: PrivateWebshop) {
        await this.storeSettingKey("webshop", webshop.encode({ version: Version }))
    }

    /**
     * Try to get a webshop as fast as possible and also initiates a background update of the webshop
     * if it is updated too long ago.
     * The goal is to have a working webshop as soon as possible.
     * Set shouldRetry to true if you don't want network errors and want to wait indefinitely for a network connection if we don't have any cached webshops
     */
    async loadWebshopIfNeeded(shouldRetry = true): Promise<PrivateWebshop> {
        if (this.webshop) {
            // If too long ago, also initiate a background update

            if (!this.lastFetchedWebshop || this.lastFetchedWebshop < new Date(new Date().getTime() - 1000*60*15)) {
                // Do a background update if not yet already doing this
                this.loadWebshop(false).catch(console.error)
            }

            console.log("Return webshop")
            return this.webshop
        }

        if (this.webshopPromise) {
            console.log("Return webshopPromise")
            return this.webshopPromise
        }
        
        console.log("Init webshopPromise")
        this.webshopPromise = (async () => {
            // Try to get it from the database, also init a background fetch if it is too long ago
            try {
                const webshop = await this.loadWebshopFromDatabase()
                if (webshop) {
                    if (this.webshop) {
                        this.webshop.set(webshop)
                    } else {
                        this.webshop = webshop
                    }
                    // todo: if too long ago, also initiate a background update

                    if (!this.lastFetchedWebshop || this.lastFetchedWebshop < new Date(new Date().getTime() - 1000*60*15)) {
                        // Do a background update if not yet already doing this
                        this.loadWebshop(false).catch(console.error)
                    }
                    return webshop
                }
            } catch (e) {
                // Possible no database support
                console.error(e)

                // Do a normal fetch
            }

            return await this.loadWebshop(shouldRetry)
        })()
        
        return this.webshopPromise.finally(() => {
            this.webshopPromise = null
        })
    }

    /**
     * Force fetch a new webshop, but prevent fetching multiple times at the same time
     */
    async loadWebshop(shouldRetry = true): Promise<PrivateWebshop> {
        
        if (this.webshopFetchPromise) {
            console.log("Return webshopFetchPromise")
            return this.webshopFetchPromise
        }

        console.log("Init webshopFetchPromise")
        
        this.webshopFetchPromise = (async () => {
            // Try to get it from the database, also init a background fetch if it is too long ago
            const webshop = await this.fetchWebshop(shouldRetry)
            this.lastFetchedWebshop = new Date()
            return webshop
        })()
        
        return this.webshopFetchPromise.then((webshop: PrivateWebshop) => {
            if (this.webshop) {
                this.webshop.set(webshop)
            } else {
                this.webshop = webshop
            }
            return webshop
        }).finally(() => {
            this.webshopFetchPromise = null
        })
    }

    async getDatabase(): Promise<IDBDatabase> {
        if (this.database) {
            return this.database
        }

        if (this.databasePromise) {
            return this.databasePromise
        }

        // Open a connection with our database
        this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
            const version = Version

            const DBOpenRequest = window.indexedDB.open('webshop-'+this.preview.id, version);
            DBOpenRequest.onsuccess = () => {
                this.database = DBOpenRequest.result;
                resolve(DBOpenRequest.result)
            }

            DBOpenRequest.onblocked = function(e) {
                console.log("DB open blocked", e);
                new Toast("Er staat een ander tabblad open van Stamhoofd die werkt in een oudere versie. Sluit die eerst af.", "error red").setHide(15*1000).show()
            };

            DBOpenRequest.onerror = (event) => {
                console.error(event)
                
                // Try to delete this database if something goes wrong
                //if (STAMHOOFD.environment == "development") {
                window.indexedDB.deleteDatabase('webshop-'+this.preview.id);
                //}

                reject(new SimpleError({
                    code: "not_supported",
                    message: "Jouw browser ondersteunt bepaalde functies niet waardoor we geen bestellingen offline kunnen bijhouden als je internet wegvalt. Probeer de pagina te herladen of in een andere browser te werken."
                }))
            };

            DBOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = DBOpenRequest.result;

                if (event.oldVersion < 1) {
                    // Version 1 is the first version of the database.
                    db.createObjectStore("orders", { keyPath: "id" });
                    const ticketStore = db.createObjectStore("tickets", { keyPath: "secret" });
                    db.createObjectStore("ticketPatches", { keyPath: "secret" });
                    db.createObjectStore("settings", {});

                    // Search tickets by order id
                    ticketStore.createIndex("orderId", "orderId", { unique: false });

                } else {
                    // For now: we clear all stores if we have a version update
                    DBOpenRequest.transaction!.objectStore("orders").clear()
                    DBOpenRequest.transaction!.objectStore("tickets").clear()
                    DBOpenRequest.transaction!.objectStore("ticketPatches").clear()
                    DBOpenRequest.transaction!.objectStore("settings").clear()

                    if (event.oldVersion < 114) {
                        const ticketStore = DBOpenRequest.transaction!.objectStore("tickets")
                        ticketStore.createIndex("orderId", "orderId", { unique: false });
                    }
                }
            };
        })

        return this.databasePromise.then(database => {
            this.databasePromise = null
            return database
        })
    }

    async readSettingKey(key: IDBValidKey): Promise<any | undefined> {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["settings"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("settings");
            const request = objectStore.get(key)

            request.onsuccess = () => {
                resolve(request.result)
            }
        })
    }

    async storeSettingKey(key: IDBValidKey, value: any) {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["settings"], "readwrite");

            transaction.oncomplete = () => {
                resolve()
            };

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("settings");
            objectStore.put(value, key)
        })
    }

    async storeOrders(orders: PrivateOrder[]) {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["orders"], "readwrite");

            transaction.oncomplete = () => {
                resolve()
            };

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("orders");

            for (const order of orders) {
                objectStore.put(order.encode({ version: Version }));
            }
        })
    }

    async getTicketsForOrder(orderId: string, withPatches = true): Promise<TicketPrivate[]> {
        const db = await this.getDatabase()

        const tickets: TicketPrivate[] = []

        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["tickets", "ticketPatches"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("tickets");
            const ticketPatches = transaction.objectStore("ticketPatches");

            const orderIndex = objectStore.index("orderId");

            const range = IDBKeyRange.only(orderId);
            const request = orderIndex.openCursor(range)
            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    const rawOrder = cursor.value
                    const ticket = TicketPrivate.decode(new ObjectData(rawOrder, { version: Version }))

                    if (withPatches) {
                        const request2 = ticketPatches.get(ticket.secret)
                        request2.onsuccess = () => {
                            const rawPatch = request2.result

                            if (rawPatch === undefined) {
                                // no patch found
                                tickets.push(ticket)
                                cursor.continue();
                                return
                            }

                            const patch = (TicketPrivate.patchType() as Decoder<AutoEncoderPatchType<TicketPrivate>>).decode(new ObjectData(rawPatch, { version: Version }))
                            tickets.push(ticket.patch(patch))
                            cursor.continue();
                        }
                    } else {
                        tickets.push(ticket)
                        cursor.continue();
                    }
                    
                } else {
                    // no more results
                    resolve()
                }
            }
        })
        
        return tickets
    }

    async streamTickets(callback: (ticket: TicketPrivate) => void): Promise<void> {
        const db = await this.getDatabase()

        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["tickets"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("tickets");

            const request = objectStore.openCursor()
            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    const rawOrder = cursor.value
                    const ticket = TicketPrivate.decode(new ObjectData(rawOrder, { version: Version }))
                    callback(ticket)
                    cursor.continue();
                } else {
                    // no more results
                    resolve()
                }
            }
        })

        await this.fetchNewTickets(false, false, (tickets: TicketPrivate[]) => {
            for (const ticket of tickets) {
                callback(ticket)
            }
        })
    }

    async streamOrders(callback: (order: PrivateOrder) => void): Promise<void> {
        const db = await this.getDatabase()

        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["orders"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("orders");

            const request = objectStore.openCursor()
            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    const rawOrder = cursor.value
                     // Todo: need version fix here
                    const order = PrivateOrder.decode(new ObjectData(rawOrder, { version: Version }))
                    callback(order)
                    cursor.continue();
                } else {
                    // no more results
                    resolve()
                }
            }
        })

        const owner = {}
        this.ordersEventBus.addListener(owner, "fetched", (orders: PrivateOrder[]) => {
            for (const order of orders) {
                callback(order)
            }
            return Promise.resolve()
        })
        await this.fetchNewOrders(false, false)
        this.ordersEventBus.removeListener(owner)
    }

    async clearOrdersFromDatabase(): Promise<void> {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["orders"], "readwrite");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("orders");

            const request = objectStore.clear()
            request.onsuccess = () => {
                resolve()
            }

        })
    }

    async getOrdersFromDatabase(): Promise<PrivateOrder[]> {
        const db = await this.getDatabase()

        return new Promise<PrivateOrder[]>((resolve, reject) => {
            const transaction = db.transaction(["orders"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("orders");

            const request = objectStore.getAll()
            request.onsuccess = () => {
                const rawOrders = request.result

                // Todo: need version fix here
                const orders = new ArrayDecoder(PrivateOrder as Decoder<PrivateOrder>).decode(new ObjectData(rawOrders, { version: Version }))
                resolve(orders)
            }

        })
    }

    async getTicketPatchesFromDatabase(): Promise<AutoEncoderPatchType<TicketPrivate>[]> {
        const db = await this.getDatabase()

        return new Promise<AutoEncoderPatchType<TicketPrivate>[]>((resolve, reject) => {
            const transaction = db.transaction(["ticketPatches"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("ticketPatches");

            const request = objectStore.getAll()
            request.onsuccess = () => {
                const rawOrders = request.result

                // Todo: need version fix here
                const patches = new ArrayDecoder(TicketPrivate.patchType() as Decoder<AutoEncoderPatchType<TicketPrivate>>).decode(new ObjectData(rawOrders, { version: Version }))
                resolve(patches)
            }

        })
    }

    async fetchOrders(query: WebshopOrdersQuery, retry = false): Promise<PaginatedResponse<PrivateOrder, WebshopOrdersQuery>> {
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "GET",
            path: "/webshop/"+this.preview.id+"/orders",
            query,
            shouldRetry: retry,
            decoder: new PaginatedResponseDecoder(PrivateOrder as Decoder<PrivateOrder>, WebshopOrdersQuery as Decoder<WebshopOrdersQuery>),
            owner: this
        })

        return response.data
    }

    async patchOrders(patches: AutoEncoderPatchType<PrivateOrder>[]) {
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "PATCH",
            path: "/webshop/"+this.preview.id+"/orders",
            decoder: new ArrayDecoder(PrivateOrder as Decoder<PrivateOrder>),
            body: patches,
            shouldRetry: false
        })

        // Move all data to original order
        try {
            await this.storeOrders(response.data)
        } catch (e) {
            console.error(e)
            // No db support or other error. Should ignore
        }

        await this.ordersEventBus.sendEvent("fetched", response.data)
        return response.data
    }

    async setlastFetchedOrder(order: PrivateOrder) {
        this.lastFetchedOrder = {
            updatedAt: order.updatedAt,
            number: order.number!
        }
        await this.storeSettingKey("lastFetchedOrder", this.lastFetchedOrder)
    }

    async addTicketPatch(patch: AutoEncoderPatchType<TicketPrivate>) {
        // First save the patch in the local database
        await this.storeTicketPatches([patch])

        // Try to save all remaining patches to the server (once)
        // Don't wait
        this.trySavePatches().catch(console.error)
    }

    async trySavePatches() {
        if (this.savingTicketPatches) {
            // Already working on it
            return
        }
        this.savingTicketPatches = true

        const patches = await this.getTicketPatchesFromDatabase()
        if (patches.length > 0) {
            try {
                await this.patchTickets(patches)
            } catch (e) {
                if (Request.isNetworkError(e)) {
                    // failed.
                    // ignore the error for now
                } else {
                    this.savingTicketPatches = false
                    throw e;
                }
            }
        }
        this.savingTicketPatches = false
    }

    async patchTickets(patches: AutoEncoderPatchType<TicketPrivate>[]) {
        // Then make one try for a request (might fail if we don't have internet)
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "PATCH",
            path: "/webshop/"+this.preview.id+"/tickets/private",
            decoder: new ArrayDecoder(TicketPrivate as Decoder<TicketPrivate>),
            body: patches,
            shouldRetry: false
        })

        // Move all data to original order
        try {
            await this.storeTickets(response.data)
        } catch (e) {
            console.error(e)
            // No db support or other error. Should ignore
        }

        return response.data
    }

    /**
     * Fetch new orders from the server.
     * Try to avoid this if needed and use the cache first + fetch changes
     */
    async fetchNewOrders(retry = false, reset = false) {
        // Todo: clear local database if resetting
        if (this.isLoadingOrders) {
            return
        }
        this.isLoadingOrders = true

        try {
            if (!reset && this.lastFetchedOrder === undefined) {
                // Only once (if undefined)
                try {
                    this.lastFetchedOrder = await this.readSettingKey("lastFetchedOrder") ?? null
                    if (this.lastFetchedOrder?.updatedAt && !this.lastUpdatedOrders) {
                        // Set initial timestamp in case of network error later on
                        this.lastUpdatedOrders = this.lastFetchedOrder.updatedAt
                    }
                } catch (e) {
                    console.error(e)
                    // Probably no database support. Ignore it and load everything.
                    this.lastFetchedOrder = null
                }
            }

            let didClear = false

            let query: WebshopOrdersQuery | undefined = reset ? WebshopOrdersQuery.create({}) : WebshopOrdersQuery.create({
                updatedSince: this.lastFetchedOrder ? this.lastFetchedOrder.updatedAt : undefined,
                afterNumber: this.lastFetchedOrder ? this.lastFetchedOrder.number : undefined,
            })

            while (query) {
                const response: PaginatedResponse<PrivateOrder, WebshopOrdersQuery> = await this.fetchOrders(query, retry)

                if (reset && !didClear) {
                    // Clear only if we have internet access
                    didClear = true
                    try {
                        await this.clearOrdersFromDatabase()
                    } catch (e) {
                        // ignore since some browsers don't support databases
                        console.error(e)
                    }
                }

                if (response.results.length > 0) {
                    // Save these orders to the local database
                    // Non-critical:
                    this.storeOrders(response.results).then(() => {
                        console.log("Saved orders to the local database")
                    }).catch(console.error)

                    // Non-critical:
                    this.setlastFetchedOrder(response.results[response.results.length - 1]).catch(console.error)

                    // Already send these new orders to our listeners, who want to know new incoming orders
                    this.ordersEventBus.sendEvent("fetched", response.results).catch(console.error)
                }
                
                query = response.next
            }
            this.lastUpdatedOrders = new Date()
        } finally {
            this.isLoadingOrders = false
        }
    }


    /// TICKETS
    async storeTickets(tickets: TicketPrivate[], clearPatches = true) {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["tickets", "ticketPatches"], "readwrite");

            transaction.oncomplete = () => {
                resolve()
            };

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("tickets");
            const ticketPatches = transaction.objectStore("ticketPatches");

            for (const ticket of tickets) {
                objectStore.put(ticket.encode({ version: Version }));

                // Remove any patches we might have saved
                if (clearPatches) {
                    ticketPatches.delete(ticket.secret);
                }
            }
        })
    }

    async storeTicketPatches(patches: AutoEncoderPatchType<TicketPrivate>[]) {
        const db = await this.getDatabase()

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["ticketPatches"], "readwrite");

            transaction.oncomplete = () => {
                resolve()
            };

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const ticketPatches = transaction.objectStore("ticketPatches");

            for (const patch of patches) {
                ticketPatches.put(patch.encode({ version: Version }));
            }
        })
    }

    async getTicketFromDatabase(secret: string, withPatches = true): Promise<TicketPrivate | undefined> {
        const db = await this.getDatabase()

        return new Promise<TicketPrivate | undefined>((resolve, reject) => {
            const transaction = db.transaction(["tickets", "ticketPatches"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("tickets");
            const ticketPatches = transaction.objectStore("ticketPatches");

            const request = objectStore.get(secret)

            request.onsuccess = () => {
                const rawTicket = request.result

                if (rawTicket === undefined) {
                    resolve(undefined)
                    return
                }

                const ticket = (TicketPrivate as Decoder<TicketPrivate>).decode(new ObjectData(rawTicket, { version: Version }))

                if (withPatches) {
                    const request2 = ticketPatches.get(secret)
                    request2.onsuccess = () => {
                        const rawPatch = request2.result

                        if (rawPatch === undefined) {
                            // no patch found
                            resolve(ticket)
                            return
                        }

                        const patch = (TicketPrivate.patchType() as Decoder<AutoEncoderPatchType<TicketPrivate>>).decode(new ObjectData(rawPatch, { version: Version }))
                        resolve(ticket.patch(patch))
                        console.log("Found patched ticket in database", patch)
                    }
                } else {
                    resolve(ticket)
                }
            }

        })
    }

    async getOrderFromDatabase(id: string): Promise<PrivateOrder | undefined> {
        const db = await this.getDatabase()

        return new Promise<PrivateOrder | undefined>((resolve, reject) => {
            const transaction = db.transaction(["orders"], "readonly");

            transaction.onerror = (event) => {
                // Don't forget to handle errors!
                reject(event)
            };

            // Do the actual saving
            const objectStore = transaction.objectStore("orders");

            const request = objectStore.get(id)
            request.onsuccess = () => {
                const rawOrder = request.result

                if (rawOrder === undefined) {
                    resolve(undefined)
                    return
                }

                const order = (PrivateOrder as Decoder<PrivateOrder>).decode(new ObjectData(rawOrder, { version: Version }))
                resolve(order)
            }

        })
    }

    async fetchTickets(query: WebshopOrdersQuery, retry = false): Promise<PaginatedResponse<TicketPrivate, WebshopTicketsQuery>> {
        const response = await SessionManager.currentSession!.authenticatedServer.request({
            method: "GET",
            path: "/webshop/"+this.preview.id+"/tickets/private",
            query,
            shouldRetry: retry,
            decoder: new PaginatedResponseDecoder(TicketPrivate as Decoder<TicketPrivate>, WebshopTicketsQuery as Decoder<WebshopTicketsQuery>),
            owner: this
        })

        return response.data
    }

    async setLastFetchedTicket(ticket: TicketPrivate) {
        this.lastFetchedTicket = {
            updatedAt: ticket.updatedAt,
            id: ticket.id!
        }
        await this.storeSettingKey("lastFetchedTicket", this.lastFetchedTicket)
    }

    /**
     * Fetch new orders from the server.
     * Try to avoid this if needed and use the cache first + fetch changes
     */
    async fetchNewTickets(retry = false, reset = false, callback?: (tickets: TicketPrivate[]) => void) {
        // Todo: clear local database if resetting
        if (this.isLoadingTickets) {
            return
        }
        this.isLoadingTickets = true

        try {
            if (this.lastFetchedTicket === undefined) {
                // Only once (if undefined)
                try {
                    this.lastFetchedTicket = await this.readSettingKey("lastFetchedTicket") ?? null

                    if (this.lastFetchedTicket?.updatedAt && !this.lastUpdatedTickets) {
                        // Set initial timestamp in case of network error later on
                        this.lastUpdatedTickets = this.lastFetchedTicket.updatedAt
                    }
                } catch (e) {
                    console.error(e)
                    // Probably no database support. Ignore it and load everything.
                    this.lastFetchedTicket = null
                }
            }
            let query: WebshopTicketsQuery | undefined = reset ? WebshopTicketsQuery.create({}) : WebshopTicketsQuery.create({
                updatedSince: this.lastFetchedTicket ? this.lastFetchedTicket.updatedAt : undefined,
                lastId: this.lastFetchedTicket ? this.lastFetchedTicket.id : undefined,
            })

            while (query) {
                const response: PaginatedResponse<TicketPrivate, WebshopTicketsQuery> = await this.fetchTickets(query, retry)

                if (response.results.length > 0) {
                    // Save these orders to the local database
                    // Non-critical:
                    this.storeTickets(response.results).then(() => {
                        console.log("Saved tickets to the local database")
                    }).catch(console.error)

                    // Non-critical:
                    this.setLastFetchedTicket(response.results[response.results.length - 1]).catch(console.error)

                    if (callback) {
                        callback(response.results)
                    }
                }
                
                query = response.next
            }
            this.lastUpdatedTickets = new Date()
        } finally {
            this.isLoadingTickets = false
        }
    }

}