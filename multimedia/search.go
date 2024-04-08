// search.go
package multimedia

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
)

type TrieNode struct {
	ctx      context.Context
	Children map[rune]*TrieNode
	Items    []LibItem // Store LibItem structs here
}

func NewTrieNode() *TrieNode {
	return &TrieNode{Children: make(map[rune]*TrieNode)}
}

// startup is called when the Library starts.
// the context is saved so we can call the runtime methods
func (t *TrieNode) Startup(ctx context.Context) {
	t.ctx = ctx
}

func (t *TrieNode) Insert(word string, item LibItem) {
	lowerWord := strings.ToLower(word) // Convert the word to lowercase
	// log.Printf("@trie.Inserting >> word %s", lowerWord)
	node := t
	for _, char := range lowerWord {
		if _, ok := node.Children[char]; !ok {
			node.Children[char] = NewTrieNode()
		}
		node = node.Children[char]
	}
	node.Items = append(node.Items, item) // Add the item to the node

	// Check if the word was inserted correctly
	// if len(node.Items) > 0 {
	// 	log.Printf("Word inserted successfully. Current node: %v, Items: %v", node, node.Items)
	// } else {
	// 	log.Printf("Failed to insert word. Current node: %v, Items: %v", node, node.Items)
	// }
}

func (t *TrieNode) Search(prefix string) []LibItem {
	log.Printf("searching %s", prefix)

	lowerPrefix := strings.ToLower(prefix)
	node := t
	for _, char := range lowerPrefix {
		if _, ok := node.Children[char]; !ok {
			return nil // Prefix not found
		}
		node = node.Children[char]
	}
	return collectItems(node, prefix)
}

func collectItems(node *TrieNode, prefix string) []LibItem {

	var items []LibItem
	if len(node.Items) > 0 {
		items = append(items, node.Items...)
	}
	for char, child := range node.Children {
		items = append(items, collectItems(child, prefix+string(char))...)
	}
	return items
}

func (t *TrieNode) ListAllContents() []LibItem {
	return collectAllItems(t)
}

func collectAllItems(node *TrieNode) []LibItem {
	var items []LibItem
	// Collect items from the current node
	items = append(items, node.Items...)
	// Recursively collect items from all children
	for _, child := range node.Children {
		items = append(items, collectAllItems(child)...)
	}
	return items
}

func (t *TrieNode) TestSearch(term string) error {
	matches := t.Search(term)
	if len(matches) > 0 {
		fmt.Print(len(matches))
		return nil
	} else {
		return errors.New("asd")
	}
}
